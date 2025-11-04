"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ProjectCoverBannerProps {
  coverImageUrl?: string;
  projectName: string;
}

export function ProjectCoverBanner({ coverImageUrl, projectName }: ProjectCoverBannerProps) {
  if (!coverImageUrl) return null;

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
      <Image
        src={coverImageUrl}
        alt={`Photo de couverture - ${projectName}`}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent" />

      {/* Optional: Badge indicator */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-md flex items-center gap-2">
        <ImageIcon size={16} className="text-slate-700" />
        <span className="text-sm font-medium text-slate-700">Photo de couverture</span>
      </div>
    </div>
  );
}
