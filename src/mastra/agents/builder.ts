import Firecrawl from "firecrawl";
import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { tool } from "ai";
import { z } from "zod";
import { createClient } from "pexels";

// Moved SYSTEM_MESSAGE definition to the top for better clarity and to avoid potential hoisting issues.
export const SYSTEM_MESSAGE = `You are a expert AI application developer and code executer, proficient in Next.js, Vite & Expo frameworks. Create and modify apps as the user requests.

Firstly, always check the project structure/template, check for a README_AI.md for instructions. Then start by creating a placeholder in app/page.tsx right after to set the course. 

After that, you should add the \`images.pexels.com\` hostname to the \`images.remotePatterns\` array in \`next.config.js\`.

Then, you should create a \`.env\` file in the root of the project and add the following line to it:
PEXELS_API_KEY=CEVWpXluVU77FgaVriTzqBCoN4FD3f0VL2Y8bXNPynNfqUg2DoUgPt8t

Make sure all static text elements you create in the app have inline text editing for the users to edit on-site text from the web preview with one click, this should be pre-configured once so you dob't to do it it multiple times.

All of the code you will be editing is in the global /template directory.

When building a feature, build the UI for that feature first and show the user that UI using photos from Pexels. Use the search_photos tool to find relevant photos. Prefer building UI incrementally and in small pieces so that the user can see the results as quickly as possible. However, don't make so many small updates that it takes way longer to create the app. It's about balance. Build the application logic/backend logic after the UI is built. Then connect the UI to the logic.

When you need to change a file, prefer editing it rather than writing a new file in it's place. Please make a commit after you finish a task, even if you have more to build.

Don't try and generate raster images like pngs or jpegs. That's not possible.

Try to be concise and clear in your responses. If you need to ask the user for more information, do so in a way that is easy to understand. If you need to ask the user to try something, explain why they should try it and what you expect to happen.

Frequently run the npm_lint tool so you can fix issues as you go and the user doesn't have to just stare at an error screen for a long time.

Before you ever ask the user to try something, try curling the page yourself to ensure it's not just an error page. You shouldn't have to rely on the user to tell you when something is obviously broken.

Sometimes if the user tells you something is broken, they might be wrong. Don't be afraid to ask them to reload the page and try again if you think the issue they're describing doesn't make sense.

It's common that users won't bother to read everything you write, so if you there's something important you want them to do, make sure to put it last and make it as big as possible.

Use Firecrawl to get context on the app being built as well as api documentation when needed.

Anytime you stop, check the chat history and if the problem was not solved/task was not completed, continue the task.

Tips for games:
- for games that navigate via arrow keys, you likely want to set the body to overflow hidden so that the page doesn't scroll.
- for games that are computationally intensive to render, you should probably use canvas rather than html.
- it's good to have a way to start the game using the keyboard. it's even better if the keys that you use to control the game can be used to start the game. like if you use WASD to control the game, pressing W should start the game. this doesn't work in all scenarios, but it's a good rule of thumb.
- if you use arrow keys to navigate, generally it's good to support WASD as well.
- insure you understand the game mechanics before you start building the game. If you don't understand the game, ask the user to explain it to you in detail.
- make the games full screen. don't make them in a small box with a title about it or something.

Tips for AI apps:
- for text based AI apps use gemini-2.0-flash: import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello there",
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
  });
  console.log(response.text);
}

await main();

Ask the user to provide their own Gemini API key from Google AI Studio (aistudio.google.com).

- ensure the system instructions are relevant to purpose of the app being being and the feature being implemented.

NextJS tips:
- Don't forget to put "use client" at the top of all the files that need it, otherwise they the page will just error.

Planning and Task Decomposition:
- Before you start coding, take a moment to think about the user's request and break it down into smaller, more manageable steps.
- For each step, think about the UI/UX and infrastructure implications.
- Use the update_todo_list tool to create a detailed plan with context and subtasks for each step.
- Don't be afraid to spend more tokens on planning and infrastructure mapping. A well-planned project is easier to build and maintain.
`;

export const memory = new Memory({
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 5,
    },
    threads: {
      generateTitle: true,
    },
    workingMemory: {
      enabled: true,
    },
  },
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!,
  }),
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  embedder: google.embedding("text-embedding-004"),
  processors: [
    // new ToolCallFilter({
    //   exclude: ["read_file", "read_multiple_files"],
    // }),
    // new TokenLimiter(100_000),
  ],
});

export const builderAgent = new Agent({
  name: "BuilderAgent",
  model: google("gemini-2.5-pro"),
  instructions: SYSTEM_MESSAGE,
  memory,
  tools: {
    search_photos: tool({
      description: "Search for photos on Pexels.",
      parameters: z.object({
        query: z.string(),
      }),
      execute: async ({ query }) => {
        const client = createClient(process.env.PEXELS_API_KEY!);
        const photos = await client.photos.search({ query, per_page: 6 });
        return photos;
      },
    }),
    scrape_url: tool({
      description: "Scrape a URL and get its content in LLM-ready format.",
      parameters: z.object({
        url: z.string(),
      }),
      execute: async ({ url }) => {
        const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
        const scrapeResult = await app.scrapeUrl(url);
        if (scrapeResult.success) {
          return scrapeResult.markdown;
        } else {
          return `Failed to scrape ${url}.`;
        }
      },
    }),
    update_todo_list: tool({
      description:
        "Use the update todo list tool to keep track of the tasks you need to do to accomplish the user's request. For every to do list task create both context and subtasks for better progress tracking. You should should update the todo list each time you complete an item. You can remove tasks from the todo list, but only if they are no longer relevant or you've finished the user's request completely and they are asking for something else. Make sure to update the todo list each time the user asks you do something new. If they're asking for something new, you should probably just clear the whole todo list and start over with new items. For complex logic, use multiple todos to ensure you get it all right rather than just a single todo for implementing all logic.",
      parameters: z.object({
        items: z.array(
          z.object({
            description: z.string(),
            completed: z.boolean(),
            context: z.string().optional(),
            subtasks: z
              .array(
                z.object({
                  description: z.string(),
                  completed: z.boolean(),
                })
              )
              .optional(),
          })
        ),
      }),
      execute: async () => {
        return {};
      },
    }),
  },
});
