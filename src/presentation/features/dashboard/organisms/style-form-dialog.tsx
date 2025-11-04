"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/presentation/shared/ui/dialog";
import { Button } from "@/presentation/shared/ui/button";
import { Input } from "@/presentation/shared/ui/input";
import { Label } from "@/presentation/shared/ui/label";
import { Textarea } from "@/presentation/shared/ui/textarea";
import { IconPicker } from "../atoms";
import { FormSection } from "../molecules";
import { Loader2 } from "lucide-react";

export interface StyleFormData {
  name: string;
  description: string;
  iconName: string;
  promptTemplate: string;
  allowFurniture: boolean;
}

interface StyleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StyleFormData) => Promise<void>;
  initialData?: Partial<StyleFormData>;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function StyleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isLoading = false,
}: StyleFormDialogProps) {
  const [formData, setFormData] = useState<StyleFormData>({
    name: "",
    description: "",
    iconName: "Sparkles",
    promptTemplate: "",
    allowFurniture: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      iconName: "Sparkles",
      promptTemplate: "",
      allowFurniture: false,
    });
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Informations de base"
            description="Nom et description du style"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nom du style *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Style Moderne"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez votre style personnalisé..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Icône</Label>
              <IconPicker
                selectedIcon={formData.iconName}
                onSelectIcon={(iconName) =>
                  setFormData({ ...formData, iconName })
                }
              />
            </div>
          </FormSection>

          <FormSection
            title="Configuration IA"
            description="Paramètres pour la génération d'images"
          >
            <div className="space-y-2">
              <Label htmlFor="promptTemplate">Prompt personnalisé (optionnel)</Label>
              <Textarea
                id="promptTemplate"
                value={formData.promptTemplate}
                onChange={(e) =>
                  setFormData({ ...formData, promptTemplate: e.target.value })
                }
                placeholder="Instructions spécifiques pour l'IA..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowFurniture"
                checked={formData.allowFurniture}
                onChange={(e) =>
                  setFormData({ ...formData, allowFurniture: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <Label htmlFor="allowFurniture" className="cursor-pointer">
                Autoriser l&apos;option &quot;avec meubles&quot;
              </Label>
            </div>
          </FormSection>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
