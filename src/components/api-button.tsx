"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CodeIcon } from "lucide-react";
import Image from "next/image";

export function ApiButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          APIs
          <CodeIcon className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>APIs Used</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Image
            src="https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//IMG_6690.png"
            alt="Pexels"
            width={20}
            height={20}
            className="mr-2"
          />
          <span>Pexels</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Image
            src="https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//IMG_6691.webp"
            alt="Gemini"
            width={20}
            height={20}
            className="mr-2"
          />
          <span>Gemini</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
