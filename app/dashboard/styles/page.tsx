"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthStore, useStylesStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  PageHeaderWithAction,
  SearchInput,
  StyleCard,
  StyleFormDialog,
  type StyleFormData,
} from "@/components/dashboard";
import { EmptyState } from "@/components/projects";

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
  const { user } = useAuthStore();
  const { styles, isLoading, fetchStyles, createStyle, updateStyle, deleteStyle } = useStylesStore();

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<EditingStyle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Charger les styles au montage
  useEffect(() => {
    if (user?.id) {
      fetchStyles(user.id);
    }
  }, [user?.id, fetchStyles]);

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

  const handleCreate = async (data: StyleFormData) => {
    if (!user?.id) return;

    await createStyle({
      name: data.name,
      description: data.description || undefined,
      iconName: data.iconName,
      promptTemplate: data.promptTemplate || undefined,
      allowFurnitureToggle: data.allowFurniture,
      userId: user.id,
    });
    setFormDialogOpen(false);
  };

  const handleUpdate = async (data: StyleFormData) => {
    if (!editingStyle) return;

    await updateStyle(editingStyle.id, {
      name: data.name,
      description: data.description || null,
      iconName: data.iconName,
      promptTemplate: data.promptTemplate || null,
      allowFurnitureToggle: data.allowFurniture,
    });
    setEditingStyle(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    await deleteStyle(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const openEditDialog = (style: EditingStyle) => {
    setEditingStyle(style);
  };

  const openCreateDialog = () => {
    setEditingStyle(null);
    setFormDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
          <div className="text-center py-12">
            <p className="text-slate-600">
              Aucun style ne correspond à &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <EmptyState
            title="Aucun style personnalisé"
            description="Créez votre premier style pour commencer"
            action={{
              label: "Créer un style",
              onClick: openCreateDialog
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        initialData={
          editingStyle
            ? {
                name: editingStyle.name,
                description: editingStyle.description || "",
                iconName: editingStyle.iconName || "Sparkles",
                promptTemplate: editingStyle.promptTemplate || "",
                allowFurniture: editingStyle.allowFurnitureToggle,
              }
            : undefined
        }
        title={editingStyle ? "Modifier le style" : "Créer un style"}
        description={
          editingStyle
            ? "Modifiez les paramètres de votre style personnalisé"
            : "Créez un nouveau style de transformation personnalisé"
        }
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce style ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
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
