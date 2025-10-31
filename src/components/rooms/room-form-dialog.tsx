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
import {
  Loader2,
  Sofa,
  BedDouble,
  ChefHat,
  Utensils,
  ShowerHead,
  Bath,
  Briefcase,
  DoorOpen,
  ArrowRight,
  Sun,
  Home,
  Trees,
  Car,
  Wine,
  Package,
  WashingMachine,
  Shirt,
  Flower2,
  Layers,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateRoom, useUpdateRoom } from "@/domain/rooms/hooks/use-rooms";
import type {
  RoomSpecification,
  RoomType,
  CreateRoomInput,
} from "@/domain/rooms/models/room";
import { ROOM_TYPE_LABELS } from "@/domain/rooms/models/room";

// Map des icônes Lucide
const iconMap: Record<string, any> = {
  Sofa,
  BedDouble,
  ChefHat,
  Utensils,
  ShowerHead,
  Bath,
  Briefcase,
  DoorOpen,
  ArrowRight,
  Sun,
  Home,
  Trees,
  Car,
  Wine,
  Package,
  WashingMachine,
  Shirt,
  Flower2,
  Layers,
  HelpCircle,
};

export interface RoomFormDialogProps {
  open: boolean;
  onClose: () => void;
  room?: RoomSpecification | null;
}

export function RoomFormDialog({ open, onClose, room }: RoomFormDialogProps) {
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

  const isEditing = !!room;

  // Form state
  const [roomType, setRoomType] = useState<RoomType>("salon");
  const [displayNameFr, setDisplayNameFr] = useState("");
  const [displayNameEn, setDisplayNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [iconName, setIconName] = useState("");

  // Contraintes par défaut (appliquées automatiquement pour toutes les pièces)
  const DEFAULT_CONSTRAINTS = "Maintain natural light sources, respect electrical outlets and switches placement, ensure proper ventilation, preserve architectural features like moldings and windows, maintain room proportions and ceiling height.";

  // Reset form when room changes
  useEffect(() => {
    if (room) {
      setRoomType(room.room_type);
      setDisplayNameFr(room.display_name_fr);
      setDisplayNameEn(room.display_name_en);
      setDescription(room.description || "");
      setAreaMin(room.typical_area_min?.toString() || "");
      setAreaMax(room.typical_area_max?.toString() || "");
      setIconName(room.icon_name || "");
    } else {
      // Reset form
      setRoomType("salon");
      setDisplayNameFr("");
      setDisplayNameEn("");
      setDescription("");
      setAreaMin("");
      setAreaMax("");
      setIconName("");
    }
  }, [room, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayNameFr || !displayNameEn) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const input: CreateRoomInput = {
      room_type: roomType,
      display_name_fr: displayNameFr,
      display_name_en: displayNameEn,
      constraints_text: DEFAULT_CONSTRAINTS, // Utiliser les contraintes par défaut
      description: description || undefined,
      typical_area_min: areaMin ? parseFloat(areaMin) : undefined,
      typical_area_max: areaMax ? parseFloat(areaMax) : undefined,
      icon_name: iconName || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          roomId: room.id,
          input,
        });
        toast.success("Pièce mise à jour avec succès");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Pièce créée avec succès");
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
          <DialogTitle>{isEditing ? "Modifier la pièce" : "Ajouter une pièce"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les spécifications de cette pièce"
              : "Créez une nouvelle spécification de pièce"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de pièce */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="roomType">Type de pièce *</Label>
              <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => {
                    const IconComponent = iconMap[label.icon] || Home;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <IconComponent size={16} />
                          <span>{label.fr} ({label.en})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Le type de pièce ne peut pas être modifié après création
              </p>
            </div>
          )}

          {isEditing && (
            <div className="p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-slate-600">
                Type de pièce: <strong>{ROOM_TYPE_LABELS[room.room_type]?.fr}</strong>
              </p>
            </div>
          )}

          {/* Noms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayNameFr">Nom français *</Label>
              <Input
                id="displayNameFr"
                value={displayNameFr}
                onChange={(e) => setDisplayNameFr(e.target.value)}
                placeholder="Ex: Salon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayNameEn">Nom anglais *</Label>
              <Input
                id="displayNameEn"
                value={displayNameEn}
                onChange={(e) => setDisplayNameEn(e.target.value)}
                placeholder="Ex: Living Room"
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
              placeholder="Description générale de ce type de pièce"
              rows={2}
            />
          </div>

          {/* Surface typique */}
          <div className="space-y-2">
            <Label>Surface typique (m²)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Min (ex: 12)"
                  type="number"
                  step="0.1"
                  value={areaMin}
                  onChange={(e) => setAreaMin(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Max (ex: 40)"
                  type="number"
                  step="0.1"
                  value={areaMax}
                  onChange={(e) => setAreaMax(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Surface typique pour ce type de pièce (optionnel)
            </p>
          </div>

          {/* Icône */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icône (emoji)</Label>
            <Input
              id="icon"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Ex: 🛋️"
              maxLength={4}
            />
            <p className="text-xs text-slate-500">
              Un emoji pour représenter cette pièce
            </p>
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
