"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui";
import { Download } from "lucide-react";
import type { Image as ImageType } from "@/lib/hooks";

/**
 * Props pour le composant ImageViewerDialog
 */
interface ImageViewerDialogProps {
  image: ImageType | null;
  transformationLabel: string;
  projectName: string;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
}

/**
 * Composant Molecule - Dialogue de visualisation d'image
 *
 * Affiche une comparaison avant/après en grand format
 */
export function ImageViewerDialog({
  image,
  transformationLabel,
  projectName,
  onClose,
  onDownload,
}: ImageViewerDialogProps) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Comparaison Avant / Après
          </DialogTitle>
          <DialogDescription>{transformationLabel}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {/* Avant */}
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Avant</p>
            <div className="relative h-[400px] rounded-md overflow-hidden bg-slate-100">
              <Image
                src={image.original_url}
                alt="Original"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Après */}
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Après</p>
            <div className="relative h-[400px] rounded-md overflow-hidden bg-slate-100">
              {image.transformed_url && (
                <Image
                  src={image.transformed_url}
                  alt="Transformé"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const filename = `${projectName}-original-${Date.now()}.png`;
              onDownload(image.original_url, filename);
            }}
          >
            <Download size={16} className="mr-2" />
            Télécharger l&apos;originale
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => {
              if (image.transformed_url) {
                const filename = `${projectName}-${transformationLabel}-${Date.now()}.png`;
                onDownload(image.transformed_url, filename);
              }
            }}
            disabled={!image.transformed_url}
          >
            <Download size={16} className="mr-2" />
            Télécharger la transformée
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
