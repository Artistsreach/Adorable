"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Trash, ExternalLink, MoreVertical, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";
import Image from "next/image";
import { searchPexelsPhotos } from "@/lib/pexels";

// Function to determine if a color is light
const isColorLight = (hexColor: string) => {
  if (!hexColor) return false;
  const color = hexColor.charAt(0) === "#" ? hexColor.substring(1, 7) : hexColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.5; // Lower threshold for better contrast with white text
};

type AppCardProps = {
  id: string;
  name: string;
  createdAt: Date;
  onDelete?: () => void;
};

export function AppCard({ id, name, createdAt, onDelete }: AppCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [avgColor, setAvgColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("text-white");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      const pexelsData = await searchPexelsPhotos(name);
      if (pexelsData) {
        setImageUrl(pexelsData.imageUrl);
        setAvgColor(pexelsData.avgColor);
        if (isColorLight(pexelsData.avgColor)) {
          setTextColor("text-gray-600");
        }
      }
    };
    fetchImage();
  }, [name]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(`/app/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await deleteApp(id);
    toast.success("App deleted successfully");
    if (onDelete) {
      onDelete();
    }

    console.log(`Delete app: ${id}`);
  };

  return (
    <Card className="p-0 rounded-xl h-32 sm:h-36 relative w-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <Loader2 className="animate-spin text-white" size={24} />
        </div>
      )}
      <Link
        href={`/app/${id}`}
        onClick={(e) => {
          e.preventDefault();
          setLoading(true);
          router.push(`/app/${id}`);
        }}
        className="cursor-pointer block h-full w-full"
      >
        {imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={name}
              layout="fill"
              objectFit="cover"
              className="z-0 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 z-10"></div>
          </div>
        )}
        {/* This div applies the blur behind the text, strongest at the top and fading down */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 backdrop-blur-[2px] z-[15]"
          style={{
            background: `linear-gradient(to bottom, ${
              avgColor || "rgba(0,0,0,0.5)"
            } 70%, transparent)`,
          }}
        ></div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#E7E9EE] to-transparent z-[15]"
          style={{
            backgroundColor: "transparent",
          }}
        ></div>
        <CardHeader className="p-3 sm:p-4 relative z-20">
          <CardTitle
            className={`text-sm sm:text-base truncate ${textColor}`}
          >
            {name}
          </CardTitle>
          <CardDescription
            className={`text-xs sm:text-sm ${
              textColor === "text-white" ? "text-white/80" : "text-gray-500"
            }`}
          >
            Created {createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Link>

      <div className="absolute top-2 right-2 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpen}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
