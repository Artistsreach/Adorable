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
import { Trash, ExternalLink, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/actions/delete-app";
import { toast } from "sonner";
import Image from "next/image";
import { searchPexelsPhotos } from "@/lib/pexels";

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

  useEffect(() => {
    const fetchImage = async () => {
      const url = await searchPexelsPhotos(name);
      setImageUrl(url);
    };
    fetchImage();
  }, [name]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Card className="p-0 border-b border border-opacity-40 rounded-xl h-32 sm:h-36 relative w-full overflow-hidden">
      <Link href={`/app/${id}`} className="cursor-pointer block h-full w-full">
        {imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={name}
              layout="fill"
              objectFit="cover"
              className="z-0 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/50 z-10"></div>
          </div>
        )}
        {/* This div applies the blur behind the text, strongest at the top and fading down */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-[2px] z-[15]"></div>
        <CardHeader className="p-3 sm:p-4 relative z-20">
          <CardTitle className="text-sm sm:text-base truncate text-white drop-shadow-md">{name}</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-white/80 drop-shadow-md">
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
