"use client";

import { memo } from "react";
import Image from "next/image";
import { Card, Button, StatusBadge, type StatusType } from "@/components/ui";
import {
  ZoomIn,
  Download,
  Trash2,
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Image as ImageType } from "@/domain/images";
import { BLUR_PLACEHOLDERS } from "@/lib/image-blur-utils";

/**
 * Props pour le composant ImageGridCard
 */
interface ImageGridCardProps {
  image: ImageType;
  transformationLabel: string;
  projectName: string;
  generatingImageId: string | null;
  onView: () => void;
  onDownload: (url: string, filename: string) => void;
  onDelete: () => void;
  onGenerate: (imageId: string) => void;
}

/**
 * Composant Molecule - Carte d'image dans la grille
 *
 * Affiche une paire d'images (originale et transformée) avec actions
 */
export const ImageGridCard = memo(function ImageGridCard({
  image,
  transformationLabel,
  projectName,
  generatingImageId,
  onView,
  onDownload,
  onDelete,
  onGenerate,
}: ImageGridCardProps) {
  const isGenerating = generatingImageId === image.id;

  return (
    <Card className="modern-card overflow-hidden">
      {/* Images comparison */}
      <div className="grid grid-cols-2 gap-0">
        {/* Original */}
        <div className="relative h-48 bg-slate-100 border-r border-slate-200">
          <Image
            src={image.originalUrl}
            alt="Original"
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDERS.imageCard}
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute top-2 left-2 px-2 py-1 glass text-xs font-semibold">
            Avant
          </div>
        </div>

        {/* Transformed */}
        <div className="relative h-48 bg-slate-100">
          {image.transformedUrl ? (
            <>
              <Image
                src={image.transformedUrl}
                alt="Transformé"
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDERS.imageCard}
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute top-2 right-2 px-2 py-1 glass text-xs font-semibold">
                Après
              </div>
            </>
          ) : image.status === "processing" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-sm animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">Génération...</p>
                <p className="text-[10px] text-slate-500 mt-1">~2m 47s</p>
              </div>
            </div>
          ) : image.status === "failed" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-center">
                <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
                <p className="text-xs text-red-700 font-medium">Échec</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <Clock size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">En attente</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            {transformationLabel}
          </span>
          <StatusBadge status={image.status as StatusType} />
        </div>

        {/* Actions pour image complétée */}
        {image.status === "completed" && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="p-0 h-8 w-8 flex-shrink-0"
              onClick={onView}
              title="Voir"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="p-0 h-8 w-8 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (image.transformedUrl) {
                  const filename = `${projectName}-${transformationLabel}-${Date.now()}.png`;
                  onDownload(image.transformedUrl, filename);
                }
              }}
              title="Télécharger"
            >
              <Download size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="p-0 h-8 w-8 flex-shrink-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              onClick={onDelete}
              title="Supprimer"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}

        {/* Actions pour image en attente */}
        {image.status === "pending" && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(image.id);
              }}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  <span className="hidden sm:inline">Génération...</span>
                </>
              ) : image.transformedUrl ? (
                <>
                  <RotateCcw size={14} className="mr-1" />
                  <span className="hidden sm:inline">Regénérer (1 crédit)</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="mr-1" />
                  <span className="hidden sm:inline">Générer (1 crédit)</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="p-0 h-8 w-8 flex-shrink-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              onClick={onDelete}
              title="Supprimer"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}

        {/* Actions pour image en cours */}
        {image.status === "processing" && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 bg-blue-100 text-blue-700 cursor-not-allowed"
              disabled
            >
              <Clock size={14} className="mr-1 animate-spin" />
              <span className="hidden sm:inline">Génération en cours...</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="p-0 h-8 w-8 flex-shrink-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              onClick={onDelete}
              title="Supprimer"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}

        {/* Actions pour image échouée */}
        {image.status === "failed" && (
          <div className="space-y-2">
            {image.errorMessage && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {image.errorMessage}
              </div>
            )}
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate(image.id);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    <span className="hidden sm:inline">Génération...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} className="mr-1" />
                    <span className="hidden sm:inline">Réessayer (1 crédit)</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="p-0 h-8 w-8 flex-shrink-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                onClick={onDelete}
                title="Supprimer"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
});
