"use client";

import { useState } from "react";
import { useStyles } from "@/contexts/styles-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  Check,
  Search,
  Sofa,
  Bed,
  Lamp,
  Coffee,
  Armchair,
  Bath,
  Utensils,
  Trees,
  Home,
  Flower2,
  Palette,
  Waves,
  Sun,
  Moon,
  Star,
  Heart,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import type { CustomStyle } from "@/types/dashboard";

// Icons disponibles pour les styles
const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: "Sofa", icon: Sofa },
  { name: "Bed", icon: Bed },
  { name: "Lamp", icon: Lamp },
  { name: "Coffee", icon: Coffee },
  { name: "Armchair", icon: Armchair },
  { name: "Bath", icon: Bath },
  { name: "Utensils", icon: Utensils },
  { name: "Trees", icon: Trees },
  { name: "Home", icon: Home },
  { name: "Flower2", icon: Flower2 },
  { name: "Palette", icon: Palette },
  { name: "Waves", icon: Waves },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
];

export default function StylesPage() {
  const { styles, addStyle, updateStyle, deleteStyle } = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("Sofa");

  const filteredStyles = styles.filter(
    (style) =>
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDialog = () => {
    setFormName("");
    setFormDescription("");
    setFormIcon("Sofa");
    setEditingStyle(null);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (style: CustomStyle) => {
    setFormName(style.name);
    setFormDescription(style.description);
    setFormIcon(style.iconName);
    setEditingStyle(style);
    setCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formName.trim() || !formDescription.trim()) {
      return;
    }

    if (editingStyle) {
      // Update existing style
      updateStyle(editingStyle.id, {
        name: formName,
        description: formDescription,
        iconName: formIcon,
      });
    } else {
      // Create new style
      const newStyle: CustomStyle = {
        id: Math.random().toString(36).substr(2, 9),
        name: formName,
        description: formDescription,
        iconName: formIcon,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addStyle(newStyle);
    }

    setCreateDialogOpen(false);
    setFormName("");
    setFormDescription("");
    setFormIcon("Sofa");
    setEditingStyle(null);
  };

  const handleDeleteStyle = (id: string) => {
    deleteStyle(id);
    setDeleteConfirmId(null);
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = availableIcons.find((i) => i.name === iconName);
    return iconObj ? iconObj.icon : Sofa;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes styles</h1>
          <p className="text-slate-600 mt-2">
            Créez vos propres styles personnalisés pour transformer vos photos
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
        >
          <Plus size={20} className="mr-2" />
          Créer un style
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">Styles créés</p>
          <p className="text-2xl font-bold text-slate-900">{styles.length}</p>
        </Card>
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">Icônes disponibles</p>
          <p className="text-2xl font-bold text-blue-600">{availableIcons.length}</p>
        </Card>
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">Styles utilisés</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          type="text"
          placeholder="Rechercher un style..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Styles Grid */}
      {filteredStyles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map((style) => {
            const IconComponent = getIconComponent(style.iconName);
            return (
              <Card key={style.id} className="modern-card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{style.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{style.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={18} className="text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(style)}>
                          <Edit3 size={14} className="mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(style.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Créé le {style.createdAt.toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="modern-card p-12 text-center">
          <Sparkles size={48} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchQuery ? "Aucun style trouvé" : "Aucun style créé"}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery
              ? "Essayez avec d'autres mots-clés"
              : "Créez votre premier style personnalisé"}
          </p>
          {!searchQuery && (
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
            >
              <Plus size={20} className="mr-2" />
              Créer un style
            </Button>
          )}
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingStyle ? "Modifier le style" : "Créer un nouveau style"}
            </DialogTitle>
            <DialogDescription>
              Définissez les caractéristiques de votre style personnalisé
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Nom du style</Label>
              <Input
                type="text"
                placeholder="Ex: Style Bohème, Minimaliste Zen..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Choisir une icône</Label>
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map((iconObj) => {
                  const Icon = iconObj.icon;
                  const isSelected = formIcon === iconObj.name;
                  return (
                    <button
                      key={iconObj.name}
                      onClick={() => setFormIcon(iconObj.name)}
                      className={`w-12 h-12 rounded-md flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? "text-blue-600" : "text-slate-600"}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Icône sélectionnée: <span className="font-semibold">{formIcon}</span>
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Description détaillée</Label>
              <Textarea
                placeholder="Décrivez précisément ce style : meubles, couleurs, matériaux, ambiance..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-slate-500">
                Soyez très précis pour obtenir les meilleurs résultats lors des transformations
              </p>
            </div>

            {/* Preview */}
            {formName && formDescription && (
              <div className="pt-4 border-t border-slate-200">
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Aperçu</Label>
                <Card className="modern-card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = getIconComponent(formIcon);
                        return <Icon size={24} className="text-white" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{formName}</h4>
                      <p className="text-xs text-slate-600">{formDescription}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formName.trim() || !formDescription.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Check size={16} className="mr-2" />
                {editingStyle ? "Enregistrer" : "Créer le style"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Supprimer le style
              </DialogTitle>
              <DialogDescription>Cette action est irréversible</DialogDescription>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              {(() => {
                const styleToDelete = styles.find((s) => s.id === deleteConfirmId);
                if (!styleToDelete) return null;

                const Icon = getIconComponent(styleToDelete.iconName);

                return (
                  <>
                    <Card className="modern-card p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <Icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">
                            {styleToDelete.name}
                          </h4>
                          <p className="text-xs text-slate-600">{styleToDelete.description}</p>
                        </div>
                      </div>
                    </Card>

                    <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
                      <Trash2 size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900">
                        Êtes-vous sûr de vouloir supprimer ce style ? Les projets utilisant ce
                        style ne seront pas affectés.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDeleteStyle(deleteConfirmId)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
