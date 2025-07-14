"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Console } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
  isHeaderVisible: boolean;
}) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId, baseId: props.baseId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);
  const [console, setConsole] = useState<Console[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console") {
        setConsole((prev) => [...prev, event.data.log]);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l transition-opacity duration-700 mt-[2px]">
      <Dialog
        open={console.filter((c) => c.level === "error").length > 0}
        onOpenChange={() => setConsole([])}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Console</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {console.map((c, i) => (
              <div key={i} className="text-red-500">
                {c.message}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <FreestyleDevServer
        ref={devServerRef}
        actions={{ requestDevServer }}
        repoId={props.repo}
        loadingComponent={({ iframeLoading, devCommandRunning }) =>
          !devCommandRunning && (
            <div className="flex items-center justify-center h-full">
              <div>
                <div className="text-center">
                  {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                </div>
                <div>
                  <div className="loader"></div>
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}

