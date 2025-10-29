"use client";

import { useState, useMemo } from "react";
import {
  useCustomStyles,
  useCreateCustomStyle,
  useUpdateCustomStyle,
  useDeleteCustomStyle,
  type CustomStyle,
} from "@/lib/hooks";
import { useAuthStore } from "@/lib/stores/auth-store";
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

export default function StylesPage() {
  const { isInitialized, user } = useAuthStore();
  const shouldFetch = isInitialized && !!user;

  // Data fetching
  const { data: styles = [], isLoading } = useCustomStyles(shouldFetch);
  const createStyle = useCreateCustomStyle();
  const updateStyle = useUpdateCustomStyle();
  const deleteStyle = useDeleteCustomStyle();

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null);
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

  const handleCreate = async (data: StyleFormData) => {
    await createStyle.mutateAsync({
      name: data.name,
      description: data.description || undefined,
      icon_name: data.iconName,
      prompt_template: data.promptTemplate || undefined,
      allow_furniture_toggle: data.allowFurniture,
    });
    setFormDialogOpen(false);
  };

  const handleUpdate = async (data: StyleFormData) => {
    if (!editingStyle) return;
    await updateStyle.mutateAsync({
      id: editingStyle.id,
      name: data.name,
      description: data.description || null,
      icon_name: data.iconName,
      prompt_template: data.promptTemplate || null,
      allow_furniture_toggle: data.allowFurniture,
    });
    setEditingStyle(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteStyle.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const openEditDialog = (style: CustomStyle) => {
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
            actionLabel="Créer un style"
            onAction={openCreateDialog}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map((style) => (
            <StyleCard
              key={style.id}
              name={style.name}
              description={style.description || undefined}
              iconName={style.icon_name || "Sparkles"}
              allowFurniture={style.allow_furniture_toggle}
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
                iconName: editingStyle.icon_name || "Sparkles",
                promptTemplate: editingStyle.prompt_template || "",
                allowFurniture: editingStyle.allow_furniture_toggle,
              }
            : undefined
        }
        title={editingStyle ? "Modifier le style" : "Créer un style"}
        description={
          editingStyle
            ? "Modifiez les paramètres de votre style personnalisé"
            : "Créez un nouveau style de transformation personnalisé"
        }
        isLoading={createStyle.isPending || updateStyle.isPending}
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
              disabled={deleteStyle.isPending}
            >
              {deleteStyle.isPending ? (
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
