import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getUserMessage } from "@/lib/message-prompt-utils";
import { getAppIdFromHeaders } from "@/lib/utils";
import { builderAgent } from "@/mastra/agents/builder";
import { CoreMessage } from "@mastra/core";
import { MCPClient } from "@mastra/mcp";
import { deleteStream, getStream, setStream } from "@/lib/streams";

export async function POST(req: Request) {
  const appId = getAppIdFromHeaders(req);
  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  const existingStream = await getStream(appId);
  if (existingStream) {
    const [stream1, stream2] = existingStream.tee();
    await setStream(appId, stream2);
    return new Response(stream1, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const { mcpEphemeralUrl, ephemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
    baseId: app.info.baseId,
  });

  const { message }: { message: CoreMessage } = await req.json();

  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: {
      dev_server: {
        url: new URL(mcpEphemeralUrl),
      },
    },
  });

  const toolsets = await mcp.getToolsets();

  const rootStream = new TransformStream();

  let fixCount = 0;
  const runAgent = async (prompt: CoreMessage) => {
    const stream = await builderAgent.stream([prompt], {
      threadId: appId,
      resourceId: appId,
      maxSteps: 100,
      maxRetries: 3,
      maxTokens: 64000,
      toolsets,
      onError: async (error) => {
        await mcp.disconnect();
        console.error("Error:", error);
      },
      onFinish: async (res) => {
        deleteStream(appId!);
        console.log("Finished with reason:", res.finishReason);

        if (res.finishReason === "tool-calls" && fixCount < 10) {
          fixCount++;
          runAgent({
            role: "user",
            content: "continue",
          });
          return;
        }

        const pageRes = await fetch(ephemeralUrl);

        if (!pageRes.ok && fixCount < 10) {
          fixCount++;
          console.log("the page errored");
          runAgent({
            role: "user",
            content: "The page returned 500. Please fix it.",
          });
          return;
        }

        const consoleRes = await fetch(
          `${ephemeralUrl}/__freestyle/console`
        );
        const consoleLogs = await consoleRes.json();
        if (
          consoleLogs.some((c: any) => c.level === "error") &&
          fixCount < 10
        ) {
          fixCount++;
          console.log("the page has console errors");
          runAgent({
            role: "user",
            content: `The page has the following console errors: ${JSON.stringify(
              consoleLogs
            )}. Please fix them.`,
          });
          return;
        }

        if (fixCount === 10) {
          console.log("reached max fix count, will not retry anymore");
        } else {
          console.log("no detected errors. ending stream");
        }

        await mcp.disconnect();
        await rootStream.writable.abort();
        console.log("Stream ended");
      },
      toolCallStreaming: true,
    });

    const dataStream = stream.toDataStream();
    dataStream.pipeThrough(rootStream, {
      preventClose: true,
    });
  };

  runAgent(message);

  const [stream1, stream2] = rootStream.readable.tee();
  await setStream(appId, stream2, getUserMessage(message));

  return new Response(stream1, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
