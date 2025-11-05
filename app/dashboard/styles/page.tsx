"use client";

import { useState, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/modules/auth";
import {
  useCustomStyles,
  useCreateCustomStyle,
  useUpdateCustomStyle,
  useDeleteCustomStyle,
  PageHeaderWithAction,
  SearchInput,
  StyleCard,
  StyleFormDialog,
} from "@/modules/styles";
import { Button } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/shared";
import { Card } from "@/shared";
import { toast } from "sonner";
import { EmptyState } from "@/shared";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

// Type pour le formulaire de style
interface StyleFormData {
  name: string;
  description: string;
  allowFurnitureToggle: boolean;
}

// Type pour le style en édition
interface EditingStyle {
  id: string;
  name: string;
  description?: string | null;
  iconName?: string | null;
  promptTemplate?: string | null;
  allowFurnitureToggle: boolean;
}

export default function StylesPage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: styles = [], isLoading, error } = useCustomStyles(user?.id);
  const createStyleMutation = useCreateCustomStyle(user?.id);
  const updateStyleMutation = useUpdateCustomStyle(user?.id);
  const deleteStyleMutation = useDeleteCustomStyle(user?.id);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<EditingStyle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter styles
  const filteredStyles = useMemo(() => {
    if (!searchQuery.trim()) return styles;
    const query = searchQuery.toLowerCase();
    return styles.filter(
      (style) =>
        style.name.toLowerCase().includes(query) ||
        style.description?.toLowerCase().includes(query)
    );
  }, [styles, searchQuery]);

  // ✅ Memoize: Handle create with loading toast
  const handleCreate = useCallback(
    async (data: StyleFormData) => {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour créer un style");
        return;
      }

      const toastId = toast.loading("Création du style...");

      try {
        await createStyleMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          allowFurnitureToggle: data.allowFurnitureToggle,
        });

        toast.success("Style créé avec succès", {
          id: toastId,
          description: `Le style "${data.name}" a été créé`,
        });

        setFormDialogOpen(false);
      } catch (error) {
        logger.error("Error creating style:", error);
        toast.error("Erreur lors de la création du style", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
        });
      }
    },
    [user?.id, createStyleMutation]
  );

  // ✅ Memoize: Handle update with loading toast
  const handleUpdate = useCallback(
    async (data: StyleFormData) => {
      if (!editingStyle) return;

      const toastId = toast.loading("Mise à jour du style...");

      try {
        await updateStyleMutation.mutateAsync({
          styleId: editingStyle.id,
          name: data.name,
          description: data.description || null,
          allowFurnitureToggle: data.allowFurnitureToggle,
        });

        toast.success("Style mis à jour avec succès", {
          id: toastId,
          description: `Le style "${data.name}" a été mis à jour`,
        });

        setEditingStyle(null);
      } catch (error) {
        logger.error("Error updating style:", error);
        toast.error("Erreur lors de la mise à jour du style", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
        });
      }
    },
    [editingStyle, updateStyleMutation]
  );

  // ✅ Memoize: Handle delete with loading toast
  const handleDelete = useCallback(async () => {
    if (!deleteConfirmId) return;

    const styleName =
      styles.find((s) => s.id === deleteConfirmId)?.name || "ce style";
    const toastId = toast.loading("Suppression en cours...");

    try {
      await deleteStyleMutation.mutateAsync(deleteConfirmId);

      toast.success("Style supprimé", {
        id: toastId,
        description: `${styleName} a été supprimé avec succès`,
      });

      setDeleteConfirmId(null);
    } catch (error) {
      logger.error("Error deleting style:", error);
      toast.error("Erreur lors de la suppression", {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer le style",
      });
    }
  }, [deleteConfirmId, deleteStyleMutation, styles]);

  // ✅ Memoize: Open edit dialog
  const openEditDialog = useCallback((style: EditingStyle) => {
    setEditingStyle(style);
  }, []);

  // ✅ Memoize: Open create dialog
  const openCreateDialog = useCallback(() => {
    setEditingStyle(null);
    setFormDialogOpen(true);
  }, []);

  // ✅ Loading state pour utilisateur
  if (isLoadingUser) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ✅ Gestion du cas utilisateur non connecté
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Non authentifié
          </h3>
          <p className="mb-4 text-slate-600">
            Vous devez être connecté pour accéder aux styles personnalisés.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ Loading state pour styles
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="border-red-200 bg-red-50 p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Erreur de chargement
          </h3>
          <p className="mb-4 text-red-700">
            {error instanceof Error ? error.message : "Une erreur est survenue"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300"
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeaderWithAction
        title="Styles personnalisés"
        description="Créez et gérez vos propres styles de transformation"
        action={
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus size={20} className="mr-2" />
            Nouveau style
          </Button>
        }
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Rechercher un style..."
      />

      {filteredStyles.length === 0 ? (
        searchQuery ? (
          <div className="py-12 text-center">
            <p className="text-slate-600">
              Aucun style ne correspond à &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="Aucun style personnalisé"
            description="Créez votre premier style pour transformer vos images selon vos préférences"
            action={{
              label: "Créer un style",
              onClick: openCreateDialog,
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStyles.map((style) => (
            <StyleCard
              key={style.id}
              name={style.name}
              description={style.description || undefined}
              iconName={style.iconName || "Sparkles"}
              allowFurniture={style.allowFurnitureToggle}
              onEdit={() => openEditDialog(style)}
              onDelete={() => setDeleteConfirmId(style.id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <StyleFormDialog
        open={formDialogOpen || !!editingStyle}
        onOpenChange={(open) => {
          if (!open) {
            setFormDialogOpen(false);
            setEditingStyle(null);
          }
        }}
        onSubmit={editingStyle ? handleUpdate : handleCreate}
        style={
          editingStyle
            ? {
                name: editingStyle.name,
                description: editingStyle.description || "",
                allowFurnitureToggle: editingStyle.allowFurnitureToggle,
              }
            : null
        }
        isSubmitting={
          createStyleMutation.isPending || updateStyleMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce style ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteStyleMutation.isPending}
            >
              {deleteStyleMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
