"use client";

import { useState, useMemo } from "react";
import { useCurrentUser } from "@/domain/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sofa, Trash2, Edit, Search, Shield, User, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useFurnitureList, useDeleteFurniture } from "@/domain/furniture/hooks/use-furniture";
import { FurnitureFormDialog } from "@/components/furniture/furniture-form-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { FurnitureItem } from "@/domain/furniture/models/furniture";

export default function FurniturePage() {
  const { data: user } = useCurrentUser();
  const { data: furnitureList = [], isLoading } = useFurnitureList();
  const deleteFurnitureMutation = useDeleteFurniture();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState<FurnitureItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [defaultSectionExpanded, setDefaultSectionExpanded] = useState(false);
  const [userSectionExpanded, setUserSectionExpanded] = useState(true);

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === "admin";

  // Séparer meubles par défaut et personnalisés
  const { defaultFurniture, userFurniture } = useMemo(() => {
    const filtered = furnitureList.filter((item) => {
      const matchesSearch =
        item.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name_en.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return {
      defaultFurniture: filtered.filter((item) => !(item as any).user_id), // user_id = NULL
      userFurniture: filtered.filter((item) => !!(item as any).user_id), // user_id = user.id
    };
  }, [furnitureList, searchQuery, selectedCategory]);

  // Vérifier si un meuble peut être modifié/supprimé par le user
  const canEditFurniture = (furniture: FurnitureItem) => {
    const furnitureUserId = (furniture as any).user_id;
    // Admin peut tout modifier, user peut modifier seulement ses meubles
    return isAdmin || furnitureUserId === user?.id;
  };

  const categories = [
    { value: "seating", label: "Assises", icon: "🪑" },
    { value: "table", label: "Tables", icon: "🪑" },
    { value: "storage", label: "Rangements", icon: "📦" },
    { value: "bed", label: "Lits", icon: "🛏️" },
    { value: "lighting", label: "Luminaires", icon: "💡" },
    { value: "decor", label: "Déco", icon: "🖼️" },
    { value: "appliance", label: "Électroménager", icon: "🔌" },
    { value: "fixture", label: "Fixtures", icon: "🚿" },
  ];

  const handleEdit = (furniture: FurnitureItem) => {
    setEditingFurniture(furniture);
    setFormDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFurnitureMutation.mutateAsync(id);
      toast.success("Meuble supprimé avec succès");
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingFurniture(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catalogue de Meubles</h1>
          <p className="text-slate-600 mt-2">
            Gérez votre catalogue de meubles pour vos projets de home staging
          </p>
        </div>
        <Button onClick={() => setFormDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Ajouter un meuble
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Rechercher un meuble..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Furniture List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : defaultFurniture.length === 0 && userFurniture.length === 0 ? (
        <Card className="p-12 text-center">
          <Sofa className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucun meuble trouvé
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || selectedCategory
              ? "Aucun meuble ne correspond à vos critères de recherche"
              : "Commencez par ajouter votre premier meuble"}
          </p>
          {!searchQuery && !selectedCategory && (
            <Button onClick={() => setFormDialogOpen(true)}>
              <Plus size={20} className="mr-2" />
              Ajouter un meuble
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Section: Meubles par défaut */}
          {defaultFurniture.length > 0 && (
            <div>
              <button
                onClick={() => setDefaultSectionExpanded(!defaultSectionExpanded)}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Meubles par défaut</h2>
                <Badge variant="secondary" className="ml-2">{defaultFurniture.length}</Badge>
                {defaultSectionExpanded ? (
                  <ChevronUp className="text-slate-600 ml-auto" size={20} />
                ) : (
                  <ChevronDown className="text-slate-600 ml-auto" size={20} />
                )}
              </button>
              {defaultSectionExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultFurniture.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <Sofa className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.name_fr}</h3>
                          <p className="text-sm text-slate-500">{item.name_en}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.is_essential && (
                          <Badge variant="default" className="bg-green-500">Essentiel</Badge>
                        )}
                      </div>

                      {item.generic_description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {item.generic_description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {item.room_types.slice(0, 3).map((roomType) => (
                          <Badge key={roomType} variant="outline" className="text-xs">
                            {roomType}
                          </Badge>
                        ))}
                        {item.room_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.room_types.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {canEditFurniture(item) && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit size={16} className="mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
                </div>
              )}
            </div>
          )}

          {/* Section: Mes meubles personnalisés */}
          {userFurniture.length > 0 && (
            <div className="rounded-lg border-2 border-green-200 bg-green-50/30 p-6">
              <button
                onClick={() => setUserSectionExpanded(!userSectionExpanded)}
                className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
              >
                <User className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Mes meubles personnalisés</h2>
                <Badge variant="default" className="ml-2 bg-green-600">{userFurniture.length}</Badge>
                {userSectionExpanded ? (
                  <ChevronUp className="text-slate-600 ml-auto" size={20} />
                ) : (
                  <ChevronDown className="text-slate-600 ml-auto" size={20} />
                )}
              </button>
              {userSectionExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userFurniture.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Sofa className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{item.name_fr}</h3>
                          <p className="text-sm text-slate-500">{item.name_en}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.is_essential && (
                          <Badge variant="default" className="bg-green-500">Essentiel</Badge>
                        )}
                      </div>

                      {item.generic_description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {item.generic_description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {item.room_types.slice(0, 3).map((roomType) => (
                          <Badge key={roomType} variant="outline" className="text-xs">
                            {roomType}
                          </Badge>
                        ))}
                        {item.room_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.room_types.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit size={16} className="mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <FurnitureFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        furniture={editingFurniture}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Supprimer ce meuble ?"
        description="Cette action est irréversible. Le meuble sera retiré du catalogue et de tous les presets."
        isDeleting={deleteFurnitureMutation.isPending}
      />
    </div>
  );
}
