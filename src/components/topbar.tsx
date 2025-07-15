"use client";

import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { ApiButton } from "./api-button";

export function TopBar({
  appName,
  children,
  codeServerUrl,
  isHeaderVisible,
  toggleHeader,
}: {
  appName: string;
  children?: React.ReactNode;
  codeServerUrl: string;
  isHeaderVisible: boolean;
  toggleHeader: () => void;
}) {
  return (
    <div className="relative z-50">
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isHeaderVisible ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="h-12 flex items-center px-4 border-b border-gray-200 bg-background justify-between">
          <Link href={"/"}>
            <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Untitled%20design%20(1).png" alt="logo" className="h-8" />
          </Link>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            {children}
            <ApiButton />
            <a target="_blank" href={codeServerUrl} className="hidden md:block">
              <Button size="sm" variant={"outline"}>
                VS Code
                <ArrowUpRightIcon />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 z-50">
        <div className="mt-2 bg-background/80 backdrop-blur-sm rounded-full">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleHeader}
            className="rounded-full h-8 w-8 p-0"
          >
            {isHeaderVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
