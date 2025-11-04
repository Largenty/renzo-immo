"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/presentation/shared/ui";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";

/**
 * Props pour le composant DeleteProjectDialog
 */
interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  totalImages?: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Composant Molecule - Dialogue de confirmation de suppression de projet
 *
 * Affiche un dialogue de confirmation avant de supprimer un projet
 */
export function DeleteProjectDialog({
  open,
  projectName,
  totalImages = 0,
  isDeleting,
  onConfirm,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Supprimer le projet ?
          </DialogTitle>
          <DialogDescription>Cette action est irréversible</DialogDescription>
        </DialogHeader>

        <div className="pt-4 space-y-4">
          {/* Project info */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              {projectName}
            </p>
            <p className="text-xs text-slate-600">
              {totalImages} image{totalImages > 1 ? 's' : ''} dans ce projet
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Attention
              </p>
              <p className="text-sm text-red-800">
                La suppression du projet entraînera la suppression de toutes les
                images associées. Cette action ne peut pas être annulée.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
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
                  Supprimer définitivement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
