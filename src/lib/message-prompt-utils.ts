import { CoreMessage } from "@mastra/core";

export function getUserMessage(message: CoreMessage): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  const textPart = message.content.find((part) => part.type === "text");
  return textPart?.text ?? "";
}
