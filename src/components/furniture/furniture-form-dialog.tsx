"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateFurniture, useUpdateFurniture } from "@/domain/furniture/hooks/use-furniture";
import type {
  FurnitureItem,
  FurnitureCategory,
  RoomType,
  CreateFurnitureInput,
} from "@/domain/furniture/models/furniture";

export interface FurnitureFormDialogProps {
  open: boolean;
  onClose: () => void;
  furniture?: FurnitureItem | null;
}

const CATEGORIES: { value: FurnitureCategory; label: string }[] = [
  { value: "seating", label: "Assises" },
  { value: "table", label: "Tables" },
  { value: "storage", label: "Rangements" },
  { value: "bed", label: "Lits" },
  { value: "lighting", label: "Luminaires" },
  { value: "decor", label: "Déco" },
  { value: "appliance", label: "Électroménager" },
  { value: "fixture", label: "Fixtures" },
];

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "salon", label: "Salon" },
  { value: "chambre", label: "Chambre" },
  { value: "cuisine", label: "Cuisine" },
  { value: "salle_a_manger", label: "Salle à manger" },
  { value: "salle_de_bain", label: "Salle de bain" },
  { value: "wc", label: "WC" },
  { value: "bureau", label: "Bureau" },
  { value: "entree", label: "Entrée" },
  { value: "couloir", label: "Couloir" },
  { value: "terrasse", label: "Terrasse" },
  { value: "balcon", label: "Balcon" },
  { value: "jardin", label: "Jardin" },
  { value: "garage", label: "Garage" },
  { value: "cave", label: "Cave" },
  { value: "grenier", label: "Grenier" },
  { value: "buanderie", label: "Buanderie" },
  { value: "dressing", label: "Dressing" },
  { value: "veranda", label: "Véranda" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "autre", label: "Autre" },
];

export function FurnitureFormDialog({ open, onClose, furniture }: FurnitureFormDialogProps) {
  const createMutation = useCreateFurniture();
  const updateMutation = useUpdateFurniture();

  const isEditing = !!furniture;

  // Form state
  const [category, setCategory] = useState<FurnitureCategory>("seating");
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isEssential, setIsEssential] = useState(false);
  const [priority, setPriority] = useState(50);
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");

  // Reset form when furniture changes
  useEffect(() => {
    if (furniture) {
      setCategory(furniture.category);
      setNameFr(furniture.name_fr);
      setNameEn(furniture.name_en);
      setDescription(furniture.generic_description || "");
      setRoomTypes(furniture.room_types);
      setIsEssential(furniture.is_essential);
      setPriority(furniture.priority);
      setWidth(furniture.typical_dimensions?.width?.toString() || "");
      setDepth(furniture.typical_dimensions?.depth?.toString() || "");
      setHeight(furniture.typical_dimensions?.height?.toString() || "");
    } else {
      // Reset form
      setCategory("seating");
      setNameFr("");
      setNameEn("");
      setDescription("");
      setRoomTypes([]);
      setIsEssential(false);
      setPriority(50);
      setWidth("");
      setDepth("");
      setHeight("");
    }
  }, [furniture, open]);

  const handleRoomTypeToggle = (roomType: RoomType) => {
    setRoomTypes((prev) =>
      prev.includes(roomType) ? prev.filter((rt) => rt !== roomType) : [...prev, roomType]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameFr || !nameEn || roomTypes.length === 0) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const input: CreateFurnitureInput = {
      category,
      name_fr: nameFr,
      name_en: nameEn,
      room_types: roomTypes,
      generic_description: description || undefined,
      is_essential: isEssential,
      priority,
      typical_dimensions:
        width || depth || height
          ? {
              width: width ? parseFloat(width) : undefined,
              depth: depth ? parseFloat(depth) : undefined,
              height: height ? parseFloat(height) : undefined,
            }
          : undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          furnitureId: furniture.id,
          input,
        });
        toast.success("Meuble mis à jour avec succès");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Meuble créé avec succès");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le meuble" : "Ajouter un meuble"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de ce meuble"
              : "Créez un nouveau meuble pour votre catalogue"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FurnitureCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Noms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameFr">Nom français *</Label>
              <Input
                id="nameFr"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="Ex: Canapé scandinave"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Nom anglais *</Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Ex: Scandinavian sofa"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description générique du meuble"
              rows={3}
            />
          </div>

          {/* Types de pièces */}
          <div className="space-y-2">
            <Label>Types de pièces compatibles *</Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {ROOM_TYPES.map((rt) => (
                <div key={rt.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-${rt.value}`}
                    checked={roomTypes.includes(rt.value)}
                    onCheckedChange={() => handleRoomTypeToggle(rt.value)}
                  />
                  <label
                    htmlFor={`room-${rt.value}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {rt.label}
                  </label>
                </div>
              ))}
            </div>
            {roomTypes.length === 0 && (
              <p className="text-sm text-red-500">Sélectionnez au moins un type de pièce</p>
            )}
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label>Dimensions typiques (cm)</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Largeur"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <Input
                placeholder="Profondeur"
                type="number"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
              <Input
                placeholder="Hauteur"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="essential"
                checked={isEssential}
                onCheckedChange={(checked) => setIsEssential(checked as boolean)}
              />
              <label htmlFor="essential" className="text-sm font-medium cursor-pointer">
                Meuble essentiel
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité (0-100)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 50)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
