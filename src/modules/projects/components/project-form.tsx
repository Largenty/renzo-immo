"use client";

import { useState, useEffect } from "react";
import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import { Input } from "@/presentation/shared/ui/input";
import { Label } from "@/presentation/shared/ui/label";
import { Textarea } from "@/presentation/shared/ui/textarea";
import { SimpleImageUpload } from "@/presentation/features/upload/simple-image-upload";
import { FolderPlus, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export interface SimpleImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface ProjectFormData {
  name: string;
  address: string;
  description: string;
}

interface ProjectFormProps {
  initialData?: ProjectFormData;
  existingCoverUrl?: string | null;
  onSubmit: (data: ProjectFormData, coverImage: File | null) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function ProjectForm({
  initialData,
  existingCoverUrl,
  onSubmit,
  isLoading = false,
  mode,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
  });

  const [coverImage, setCoverImage] = useState<SimpleImageFile | null>(null);
  const [showExistingCover, setShowExistingCover] = useState(!!existingCoverUrl);

  // Mettre à jour le formulaire quand les données initiales changent
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, coverImage?.file || null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilesAdded = (newFiles: SimpleImageFile[]) => {
    if (newFiles.length > 0) {
      setCoverImage(newFiles[0]);
      setShowExistingCover(false); // Cacher l'image existante
    }
  };

  const handleFileRemoved = (id: string) => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage.preview);
    }
    setCoverImage(null);
  };

  const isCreateMode = mode === "create";
  const submitButtonText = isCreateMode
    ? coverImage
      ? "Créer avec photo de couverture"
      : "Créer le projet"
    : "Enregistrer les modifications";

  const SubmitIcon = isCreateMode ? FolderPlus : Save;

  return (
    <Card className="modern-card p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-semibold">
            Nom du projet <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ex: Villa Moderne - Cannes"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-12 bg-white border-slate-300 text-slate-900"
          />
          <p className="text-sm text-slate-500">
            Donnez un nom descriptif à votre projet
          </p>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-slate-700 font-semibold">
            Adresse du bien
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Ex: 45 Boulevard de la Croisette, Cannes"
            value={formData.address}
            onChange={handleChange}
            disabled={isLoading}
            className="h-12 bg-white border-slate-300 text-slate-900"
          />
          <p className="text-sm text-slate-500">
            L&apos;adresse complète du bien immobilier (optionnel)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-700 font-semibold">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Ex: Rénovation complète d'une villa moderne de 250m²"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            className="min-h-[120px] bg-white border-slate-300 text-slate-900 resize-none"
          />
          <p className="text-sm text-slate-500">
            Notes ou informations complémentaires (optionnel)
          </p>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-semibold">
            Photo de couverture
          </Label>
          {showExistingCover && existingCoverUrl && !coverImage && (
            <div className="mb-4">
              <img
                src={existingCoverUrl}
                alt="Cover actuelle"
                className="w-full h-48 object-cover rounded-md"
              />
              <p className="text-sm text-slate-500 mt-2">
                Image de couverture actuelle
              </p>
            </div>
          )}
          <SimpleImageUpload
            files={coverImage ? [coverImage] : []}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            singleImage={true}
          />
          <p className="text-sm text-slate-500">
            {coverImage
              ? mode === "create"
                ? "Photo de couverture ajoutée"
                : "Nouvelle photo de couverture sélectionnée"
              : existingCoverUrl && mode === "edit"
              ? "Ajoutez une nouvelle photo pour remplacer l'actuelle (optionnel)"
              : "Ajoutez une belle photo pour illustrer votre projet (optionnel)"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
          <Link href="/dashboard/projects" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-slate-300"
              disabled={isLoading}
            >
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
            disabled={!formData.name || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                {mode === "create"
                  ? "Création en cours..."
                  : "Mise à jour en cours..."}
              </>
            ) : (
              <>
                <SubmitIcon size={20} className="mr-2" />
                {submitButtonText}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
