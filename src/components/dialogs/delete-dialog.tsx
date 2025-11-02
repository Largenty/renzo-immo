"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteDialogProps {
  /**
   * Contrôle l'ouverture du dialog
   */
  open: boolean;
  /**
   * Callback pour fermer le dialog
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Callback quand l'utilisateur confirme la suppression
   */
  onConfirm: () => void | Promise<void>;
  /**
   * Titre du dialog
   * @default "Confirmer la suppression"
   */
  title?: string;
  /**
   * Description/message d'avertissement
   * @default "Cette action est irréversible."
   */
  description?: string;
  /**
   * Nom de l'entité à supprimer (pour le message)
   * @default "cet élément"
   */
  entityName?: string;
  /**
   * État de chargement pendant la suppression
   */
  isLoading?: boolean;
  /**
   * Texte du bouton de confirmation
   * @default "Supprimer"
   */
  confirmText?: string;
  /**
   * Texte du bouton d'annulation
   * @default "Annuler"
   */
  cancelText?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmer la suppression",
  description,
  entityName = "cet élément",
  isLoading = false,
  confirmText = "Supprimer",
  cancelText = "Annuler",
}: DeleteDialogProps) {
  const defaultDescription = `Êtes-vous sûr de vouloir supprimer ${entityName} ? Cette action est irréversible et toutes les données associées seront définitivement perdues.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-md bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
