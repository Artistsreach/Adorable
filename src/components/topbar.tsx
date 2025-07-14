"use client";

import {
  ArrowUpRightIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";

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
            <HomeIcon />
          </Link>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            {children}
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
