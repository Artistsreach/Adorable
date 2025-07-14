"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { FrameworkSelectorGroup } from "@/components/framework-selector-group";
import Image from "next/image";
import { useEffect, useState as useReactState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { unstable_ViewTransition as ViewTransition } from "react";
import { UserButton } from "@stackframe/stack";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("next");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useReactState(false);
  const router = useRouter();

  // For the typing animation
  const placeholderRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderText, setPlaceholderText] = useState("");
  const fullPlaceholder = "I want to build";
  const exampleIdeas = [
    "a real-time collaborative whiteboard",
    "an AI-powered content summarizer",
    "a decentralized social media platform",
    "a gamified habit tracker",
    "a personalized e-commerce recommendation engine",
  ];

  // Ensure hydration is complete before starting typing animation
  useEffect(() => {
    setIsMounted(true);
  });

  // Typing animation effect
  useEffect(() => {
    if (!isMounted) return;

    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let typingTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    const typeNextCharacter = () => {
      {
        // Start typing the current example idea
        const currentIdea = exampleIdeas[currentTextIndex];
        if (currentCharIndex < currentIdea.length) {
          setPlaceholderText(
            fullPlaceholder +
              " " +
              currentIdea.substring(0, currentCharIndex + 1)
          );
          currentCharIndex++;
          typingTimer = setTimeout(typeNextCharacter, 100);
        } else {
          // Pause at the end of typing the example
          pauseTimer = setTimeout(() => {
            // Begin erasing the example
            eraseText();
          }, 2000);
        }
      }
    };

    const eraseText = () => {
      const currentIdea = exampleIdeas[currentTextIndex];
      if (currentCharIndex > 0) {
        setPlaceholderText(
          fullPlaceholder + " " + currentIdea.substring(0, currentCharIndex - 1)
        );
        currentCharIndex--;
        typingTimer = setTimeout(eraseText, 50);
      } else {
        // Move to the next example
        currentTextIndex = (currentTextIndex + 1) % exampleIdeas.length;
        pauseTimer = setTimeout(() => {
          typingTimer = setTimeout(typeNextCharacter, 100);
        }, 500);
      }
    };

    // Start the typing animation
    typingTimer = setTimeout(typeNextCharacter, 500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [isMounted]);

  const handleSubmit = async () => {
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&baseId=${
        {
          next: "nextjs-dkjfgdf",
          vite: "vite-skdjfls",
          expo: "expo-lksadfp",
        }[framework]
      }`
    );
  };

  return (
    <ViewTransition>
      <QueryClientProvider client={queryClient}>
        <main className="min-h-screen p-4 relative main-bg">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-lg font-bold flex-1 sm:w-80">
              <a></a>
            </h1>
            <div className="flex items-center gap-2 flex-1 sm:w-80 justify-end">
              <UserButton />
            </div>
          </div>
          <div className="grid">
            <div className="w-full -mx-1 flex flex-col items-end col-start-1 col-end-1 row-start-1 row-end-1 opacity-20 select-none">
              {/* placeholder for background */}
            </div>
            <div className="w-full max-w-lg px-4 sm:px-0 mx-auto flex flex-col items-center mt-[-25px] sm:mt-[-1px] md:mt-[31px] col-start-1 col-end-1 row-start-1 row-end-1 z-10">
              <Image
                className="mx-2 mb-4"
                src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design.png"
                alt="Fresh Logo"
                width={60}
                height={60}
              />
              <p className="text-black text-center mb-6 text-3xl sm:text-4xl md:text-5xl font-bold">
                What do you want to build?
              </p>

              <div className="w-full relative my-5">
                <div className="relative w-full max-w-full overflow-hidden rounded-3xl border border-blue-300/20 bg-white/80 backdrop-blur-sm shimmer-effect">
                  <div className="w-full bg-white rounded-3xl relative z-10 transition-colors">
                    <PromptInput
                      isLoading={isLoading}
                      value={prompt}
                      onValueChange={setPrompt}
                      onSubmit={handleSubmit}
                      className="relative z-10 border-none bg-white shadow-none focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-200 ease-in-out "
                    >
                      <PromptInputTextarea
                        ref={placeholderRef}
                        placeholder={placeholderText ?? fullPlaceholder}
                        className="min-h-[100px] w-full bg-white dark:bg-white pr-12 text-black placeholder:text-gray-500"
                        onBlur={() => {}}
                      />
                      <PromptInputActions>
                        <Button
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isLoading || !prompt.trim()}
                          className="h-7 text-xs text-white w-full bg-blue-500 rounded-full"
                        >
                          <span className="hidden sm:inline">
                            Build It
                          </span>
                          <span className="sm:hidden">Build It</span>
                        </Button>
                      </PromptInputActions>
                    </PromptInput>
                  </div>
                </div>
              </div>
              <FrameworkSelectorGroup
                value={framework}
                onChange={setFramework}
                className="mt-4"
              />
              <Examples setPrompt={setPrompt} />
            </div>
          </div>
          <div className="py-8 mx-0 sm:-mx-4 mt-10">
            <UserApps />
          </div>
        </main>
      </QueryClientProvider>
    </ViewTransition>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap justify-center gap-2 px-2">
        <ExampleButton
          text="Collaborative Whiteboard"
          promptText="Build a real-time collaborative whiteboard application with drawing tools and user presence."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="AI Summarizer"
          promptText="Develop an AI-powered tool that summarizes long articles or documents into concise bullet points."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Decentralized Social Media"
          promptText="Create a decentralized social media platform using blockchain technology for secure and censorship-resistant communication."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
      </div>
    </div>
  );
}
