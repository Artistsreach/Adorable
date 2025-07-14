"use client";

import React, { useEffect, useState } from "react";
import Chat from "./chat";
import Preview from "./preview";
import { Message } from "ai";
import { createContext } from "react";
import { useContext } from "react";
import { TopBar } from "./topbar";
import {
  MessageCircle,
  Monitor,
  PanelBottomClose,
  PanelTopClose,
  RefreshCwIcon,
} from "lucide-react";
import { ShareButton } from "./share-button";
import { Button } from "./ui/button";

export const RepoContext = createContext<string | undefined>(undefined);

export function useCurrentRepo() {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error("useCurrentRepo must be used within a RepoProvider");
  }
  return context;
}

export default function AppWrapper({
  appName,
  repo,
  initialMessages,
  appId,
  repoId,
  baseId,
  codeServerUrl,
  domain,
}: {
  appName: string;
  repo: string;
  appId: string;
  respond?: boolean;
  initialMessages: Message[];
  repoId: string;
  baseId: string;
  codeServerUrl: string;
  domain?: string;
}) {
  const [activeView, setActiveView] = useState<"web" | "files">("web");
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "preview">("chat");
  const [isMobile, setIsMobile] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [collapseState, setCollapseState] = useState(0); // 0: expanded, 1: partially, 2: fully

  const isFullyCollapsedMobile = isMobile && collapseState === 2;

  const toggleHeader = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // or 'visible'
    };
  }, []);

  return (
    <RepoContext.Provider value={repoId}>
      <div className="h-screen flex flex-col" style={{ height: '100dvh' }}>
        {/* Desktop and Mobile container */}
        <div className="flex-1 overflow-hidden flex flex-col md:relative">
          <TopBar
            appName={appName}
            codeServerUrl={codeServerUrl}
            isHeaderVisible={isHeaderVisible}
            toggleHeader={toggleHeader}
          >
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => window.location.reload()}
            >
              <RefreshCwIcon />
            </Button>
            <ShareButton domain={domain} appId={appId} />
          </TopBar>
          {/* Chat component - positioned for both mobile and desktop */}
          <div
            className={
              isMobile
                ? `absolute z-40 flex flex-col transition-transform duration-200 ${
                    isFullyCollapsedMobile
                      ? "inset-x-0 bottom-0"
                      : `inset-0 ${
                          mobileActiveTab === "chat"
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }`
                  }`
                : `absolute z-30 bottom-0 left-0 w-1/3 flex flex-col bg-background/80 backdrop-blur-sm m-[10px] transition-all duration-300 rounded-2xl overflow-hidden ${
                    collapseState === 0
                      ? "h-[calc(100%-4rem)]"
                      : collapseState === 1
                      ? "h-1/2"
                      : "h-28"
                  }`
            }
            style={
              isMobile
                ? isFullyCollapsedMobile
                  ? { paddingBottom: "env(safe-area-inset-bottom)" }
                  : {
                      top: "env(safe-area-inset-top)",
                      bottom: "calc(60px + env(safe-area-inset-bottom))",
                    }
                : undefined
            }
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapseState((prev) => (prev + 1) % 3)}
              className="absolute top-2 right-2 z-50"
            >
              {collapseState !== 0 ? <PanelBottomClose /> : <PanelTopClose />}
            </Button>
            <div className="flex-1 min-h-0">
              <Chat
                appId={appId}
                initialMessages={initialMessages}
                collapseState={collapseState}
              />
            </div>
          </div>

          {/* Preview component - positioned for both mobile and desktop */}
          <div
            className={
              isMobile
                ? `absolute z-0 transition-transform duration-200 ${
                    isFullyCollapsedMobile
                      ? "inset-0"
                      : `inset-0 ${
                          mobileActiveTab === "preview"
                            ? "translate-x-0"
                            : "translate-x-full"
                        }`
                  }`
                : "overflow-auto h-full z-0"
            }
            style={
              isMobile
                ? isFullyCollapsedMobile
                  ? {
                      top: "env(safe-area-inset-top)",
                      paddingBottom:
                        "calc(120px + env(safe-area-inset-bottom))",
                    }
                  : {
                      top: "env(safe-area-inset-top)",
                      bottom: "calc(60px + env(safe-area-inset-bottom))",
                    }
                : undefined
            }
          >
            <Preview
              activeView={activeView}
              repo={repo}
              baseId={baseId}
              appId={appId}
              domain={domain}
              isHeaderVisible={isHeaderVisible}
            />
          </div>
        </div>

        {/* Mobile tab navigation */}
        {isMobile && !isFullyCollapsedMobile && (
          <div className="fixed bottom-0 left-0 right-0 flex border-t bg-background/95 backdrop-blur-sm pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <button
              onClick={() => setMobileActiveTab("chat")}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                mobileActiveTab === "chat"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className={`h-6 w-6 mb-1 ${mobileActiveTab === "chat" ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setMobileActiveTab("preview")}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                mobileActiveTab === "preview"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className={`h-6 w-6 mb-1 ${mobileActiveTab === "preview" ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">Preview</span>
            </button>
          </div>
        )}
      </div>
    </RepoContext.Provider>
  );
}
