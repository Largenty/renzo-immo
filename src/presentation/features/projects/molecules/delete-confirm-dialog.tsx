"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/presentation/shared/ui";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import type { Image as ImageType } from "@/domain/images";

/**
 * Props pour le composant DeleteConfirmDialog
 */
interface DeleteConfirmDialogProps {
  image: ImageType | null;
  transformationLabel: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Composant Molecule - Dialogue de confirmation de suppression
 *
 * Affiche un dialogue de confirmation avant de supprimer une image
 */
export function DeleteConfirmDialog({
  image,
  transformationLabel,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription>Cette action est irréversible</DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          {/* Image preview */}
          <div className="space-y-3">
            <div className="relative h-32 rounded-md overflow-hidden bg-slate-100">
              <Image
                src={image.originalUrl}
                alt="Image à supprimer"
                fill
                className="object-cover"
              />
            </div>

            {/* Image details */}
            <div className="text-sm text-slate-600">
              <p className="mb-1">
                <span className="font-semibold text-slate-900">Type:</span>{" "}
                {transformationLabel}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Statut:</span>{" "}
                {image.status === "completed" && "Terminé"}
                {image.status === "pending" && "En attente"}
                {image.status === "processing" && "En cours"}
                {image.status === "failed" && "Échoué"}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-900">
              Êtes-vous sûr de vouloir supprimer cette image ? Cette action ne
              peut pas être annulée.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
