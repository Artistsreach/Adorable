"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type FrameworkSelectorGroupProps = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function FrameworkSelectorGroup({
  value = "next",
  onChange,
  className,
}: FrameworkSelectorGroupProps) {
  const frameworks = [
    { id: "next", name: "Next.js", logo: "/logos/next.svg" },
    { id: "vite", name: "Vite", logo: "/logos/vite.svg" },
    { id: "expo", name: "Expo", logo: "/logos/expo.svg" },
  ];

  const handleSelect = (framework: string) => {
    onChange?.(framework);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {frameworks.map((fw) => (
        <button
          key={fw.id}
          onClick={() => handleSelect(fw.id)}
          className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-md border transition-all",
            value === fw.id
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent"
          )}
        >
          <Image
            src={fw.logo}
            alt={fw.name}
            width={20}
            height={20}
            className="opacity-90"
          />
          <span className="text-sm">{fw.name}</span>
        </button>
      ))}
    </div>
  );
}
