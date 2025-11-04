import { Card } from "@/presentation/shared/ui/card";
import Image from "next/image";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { useMemo, memo } from "react";
import { BLUR_PLACEHOLDERS } from "@/lib/image-blur-utils";

interface ProjectCardProps {
  id: string;
  name: string;
  address?: string;
  coverImageUrl?: string;
  totalImages: number;
  completedImages: number;
  updatedAt: string;
}

export const ProjectCard = memo(function ProjectCard({
  id,
  name,
  address,
  coverImageUrl,
  totalImages,
  completedImages,
  updatedAt,
}: ProjectCardProps) {
  const progress = useMemo(
    () => totalImages > 0 ? Math.round((completedImages / totalImages) * 100) : 0,
    [totalImages, completedImages]
  );

  return (
    <Link href={`/dashboard/projects/${id}`} aria-label={`Voir le projet ${name}`}>
      <Card className="modern-card overflow-hidden group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        {/* Cover Image */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          {coverImageUrl ? (
            <>
              <Image
                src={coverImageUrl}
                alt={name}
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDERS.projectCard}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
              <FolderOpen size={48} className="text-slate-300" />
            </div>
          )}

          {/* Progress badge */}
          {totalImages > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 glass text-xs font-semibold text-slate-900">
              {completedImages}/{totalImages} images
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          {address && <p className="text-sm text-slate-600 mb-4">{address}</p>}

          {/* Progress bar */}
          {totalImages > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Progression</span>
                <span className="text-slate-900 font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Mis à jour {new Date(updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </Card>
    </Link>
  );
});
