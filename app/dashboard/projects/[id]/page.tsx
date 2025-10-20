"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUploader } from "@/components/upload/image-uploader";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Download,
  Check,
  Clock,
  AlertCircle,
  ZoomIn,
  Trash2,
  RotateCcw,
  Edit3,
  MoreVertical,
} from "lucide-react";
import type { ImagePair, TransformationType } from "@/types/dashboard";
import { useStyles } from "@/contexts/styles-context";
import { getAllTransformationTypes, getTransformationLabel } from "@/lib/transformation-types";

// Mock data
const project = {
  id: "1",
  name: "Villa Moderne - Cannes",
  address: "45 Boulevard de la Croisette, Cannes",
  description: "Rénovation complète d'une villa moderne de 250m²",
  createdAt: "2025-01-15",
};

const initialMockImages: ImagePair[] = [
  {
    id: "1",
    originalUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    transformedUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
    transformationType: "depersonnalisation",
    status: "completed",
    createdAt: new Date("2025-01-15T10:00:00"),
    completedAt: new Date("2025-01-15T10:02:47"),
    wasGenerated: true,
  },
  {
    id: "2",
    originalUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    transformedUrl: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80",
    transformationType: "home_staging_moderne",
    status: "completed",
    createdAt: new Date("2025-01-15T10:05:00"),
    completedAt: new Date("2025-01-15T10:07:23"),
    wasGenerated: true,
  },
];


// Simulated transformed images for different types
const simulatedTransforms: Record<string, string[]> = {
  depersonnalisation: [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80",
  ],
  depersonnalisation_premium: [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80",
  ],
  home_staging_moderne: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  ],
  home_staging_scandinave: [
    "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&q=80",
  ],
  home_staging_industriel: [
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&q=80",
  ],
  renovation_luxe: [
    "https://images.unsplash.com/photo-1600607688960-e095ff83135c?w=1200&q=80",
    "https://images.unsplash.com/photo-1600573472556-e636b95fc900?w=1200&q=80",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200&q=80",
  ],
  renovation_contemporaine: [
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753355-5665b0e8b8de?w=1200&q=80",
  ],
  style_personnalise: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    "https://images.unsplash.com/photo-1600494448655-1e725a199a2f?w=1200&q=80",
    "https://images.unsplash.com/photo-1600566752229-250ed79470a7?w=1200&q=80",
  ],
};

// Default images for custom styles (fallback)
const defaultTransformImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
  "https://images.unsplash.com/photo-1600494448655-1e725a199a2f?w=1200&q=80",
  "https://images.unsplash.com/photo-1600566752229-250ed79470a7?w=1200&q=80",
];

export default function ProjectDetailPage() {
  const { styles: customStyles } = useStyles();
  const transformationOptions = getAllTransformationTypes(customStyles);

  const [images, setImages] = useState<ImagePair[]>(initialMockImages);
  const [selectedImage, setSelectedImage] = useState<ImagePair | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "completed" | "pending">("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit modal states
  const [selectedType, setSelectedType] = useState<TransformationType | null>(null);
  const [customPromptEdit, setCustomPromptEdit] = useState("");
  const [withFurnitureEdit, setWithFurnitureEdit] = useState<boolean | undefined>(undefined);

  const filteredImages = images.filter((img) => {
    if (viewMode === "all") return true;
    if (viewMode === "completed") return img.status === "completed";
    if (viewMode === "pending") return img.status === "pending" || img.status === "processing";
    return true;
  });

  const stats = {
    total: images.length,
    completed: images.filter((i) => i.status === "completed").length,
    processing: images.filter((i) => i.status === "processing").length,
    pending: images.filter((i) => i.status === "pending").length,
  };

  // Simulate image processing
  const simulateGeneration = (imageId: string) => {
    // Set to processing
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, status: "processing" as const } : img
      )
    );

    // After 3 seconds, complete
    setTimeout(() => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            // Use fallback for custom styles or unknown types
            const transformImages = simulatedTransforms[img.transformationType] || defaultTransformImages;
            const randomTransform = transformImages[Math.floor(Math.random() * transformImages.length)];
            return {
              ...img,
              status: "completed" as const,
              transformedUrl: randomTransform,
              completedAt: new Date(),
              wasGenerated: true,
            };
          }
          return img;
        })
      );
    }, 3000);
  };

  const handleUploadComplete = (uploadedFiles: any[]) => {
    const newImages: ImagePair[] = uploadedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      originalUrl: file.preview,
      transformationType: file.transformationType,
      status: "pending" as const,
      createdAt: new Date(),
    }));

    setImages((prev) => [...newImages, ...prev]);
    setUploadDialogOpen(false);

    // Show toast notification
    console.log(`${newImages.length} images ajoutées avec succès!`);
  };

  const deleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    console.log(`Image ${id} supprimée`);
  };

  const regenerateImage = (imageId: string, newType: TransformationType, customPrompt?: string, withFurniture?: boolean) => {
    // Reset image to pending with new transformation type
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              transformationType: newType,
              status: "pending" as const,
              transformedUrl: undefined,
              completedAt: undefined,
              customPrompt: customPrompt || undefined,
              withFurniture: withFurniture,
            }
          : img
      )
    );
    setEditingImageId(null);
    setSelectedType(null);
    setCustomPromptEdit("");
    setWithFurnitureEdit(undefined);
    console.log(`Image ${imageId} prête à être regénérée avec ${newType}`);
  };

  const handleValidateEdit = () => {
    if (!editingImageId || !selectedType) return;

    if (selectedType === "style_personnalise" && !customPromptEdit.trim()) {
      // Ne pas valider si style personnalisé sans prompt
      return;
    }

    regenerateImage(editingImageId, selectedType, customPromptEdit, withFurnitureEdit);
  };

  const getStatusBadge = (status: ImagePair["status"]) => {
    const badges = {
      completed: {
        icon: Check,
        text: "Terminé",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      processing: {
        icon: Clock,
        text: "En cours",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      pending: {
        icon: Clock,
        text: "En attente",
        className: "bg-slate-100 text-slate-700 border-slate-200",
      },
      failed: {
        icon: AlertCircle,
        text: "Échoué",
        className: "bg-red-50 text-red-700 border-red-200",
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-semibold ${badge.className}`}>
        <Icon size={12} />
        {badge.text}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" className="mb-4 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={16} className="mr-2" />
            Retour aux projets
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-600 mt-1">{project.address}</p>
            {project.description && (
              <p className="text-sm text-slate-500 mt-2">{project.description}</p>
            )}
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
                <Upload size={20} className="mr-2" />
                Ajouter des photos
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Ajouter des photos</DialogTitle>
                <DialogDescription>
                  Téléchargez vos photos immobilières et choisissez le type de transformation
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">
                <ImageUploader onUploadComplete={handleUploadComplete} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </Card>
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">Terminées</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">En cours</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </Card>
        <Card className="modern-card p-4">
          <p className="text-sm text-slate-600 font-medium mb-1">En attente</p>
          <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "all" ? "default" : "outline"}
          onClick={() => setViewMode("all")}
          className={viewMode === "all" ? "bg-slate-900" : ""}
        >
          Toutes ({stats.total})
        </Button>
        <Button
          variant={viewMode === "completed" ? "default" : "outline"}
          onClick={() => setViewMode("completed")}
          className={viewMode === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Terminées ({stats.completed})
        </Button>
        <Button
          variant={viewMode === "pending" ? "default" : "outline"}
          onClick={() => setViewMode("pending")}
          className={viewMode === "pending" ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          À traiter ({stats.processing + stats.pending})
        </Button>
      </div>

      {/* Images Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((imagePair) => (
            <Card key={imagePair.id} className="modern-card overflow-hidden">
              <div className="grid grid-cols-2 gap-0">
                {/* Original */}
                <div className="relative h-48 bg-slate-100 border-r border-slate-200">
                  <Image
                    src={imagePair.originalUrl}
                    alt="Original"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 glass text-xs font-semibold">
                    Avant
                  </div>
                </div>

                {/* Transformed */}
                <div className="relative h-48 bg-slate-100">
                  {imagePair.transformedUrl ? (
                    <>
                      <Image
                        src={imagePair.transformedUrl}
                        alt="Transformé"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 glass text-xs font-semibold">
                        Après
                      </div>
                    </>
                  ) : imagePair.status === "processing" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-sm animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-600 font-medium">
                          Génération...
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">~2m 47s</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <Clock size={24} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 font-medium">
                          En attente
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    {getTransformationLabel(imagePair.transformationType, customStyles)}
                  </span>
                  {getStatusBadge(imagePair.status)}
                </div>

                {imagePair.status === "completed" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedImage(imagePair)}
                    >
                      <ZoomIn size={14} className="mr-1" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download size={14} className="mr-1" />
                      Télécharger
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="px-2">
                          <MoreVertical size={16} className="text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingImageId(imagePair.id)}>
                          <Edit3 size={14} className="mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(imagePair.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {imagePair.status === "pending" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => simulateGeneration(imagePair.id)}
                      >
                        {imagePair.wasGenerated ? (
                          <>
                            <RotateCcw size={14} className="mr-1" />
                            Regénérer (1 crédit)
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="mr-1" />
                            Générer (1 crédit)
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="px-2">
                            <MoreVertical size={16} className="text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingImageId(imagePair.id)}>
                            <Edit3 size={14} className="mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmId(imagePair.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}

                {imagePair.status === "processing" && (
                  <Button
                    size="sm"
                    className="w-full bg-blue-100 text-blue-700 cursor-not-allowed"
                    disabled
                  >
                    <Clock size={14} className="mr-1 animate-spin" />
                    Génération en cours...
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="modern-card p-12 text-center">
          <Upload size={48} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Aucune image
          </h3>
          <p className="text-slate-600 mb-6">
            {viewMode === "all"
              ? "Ajoutez vos premières photos pour commencer"
              : `Aucune image dans la catégorie "${
                  viewMode === "completed" ? "Terminées" : "À traiter"
                }"`}
          </p>
          {viewMode === "all" && (
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload size={20} className="mr-2" />
              Ajouter des photos
            </Button>
          )}
        </Card>
      )}

      {/* Image viewer dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-6xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Comparaison Avant / Après</DialogTitle>
              <DialogDescription>
                {getTransformationLabel(selectedImage.transformationType, customStyles)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Avant</p>
                <div className="relative h-[400px] rounded-md overflow-hidden bg-slate-100">
                  <Image
                    src={selectedImage.originalUrl}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Après</p>
                <div className="relative h-[400px] rounded-md overflow-hidden bg-slate-100">
                  {selectedImage.transformedUrl && (
                    <Image
                      src={selectedImage.transformedUrl}
                      alt="Transformé"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <Download size={16} className="mr-2" />
                Télécharger l'originale
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Download size={16} className="mr-2" />
                Télécharger la transformée
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit transformation type dialog */}
      {editingImageId && (
        <Dialog
          open={!!editingImageId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingImageId(null);
              setSelectedType(null);
              setCustomPromptEdit("");
              setWithFurnitureEdit(undefined);
            }
          }}
        >
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Modifier le type de transformation</DialogTitle>
              <DialogDescription>
                Choisissez un nouveau style de transformation pour cette image
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4 space-y-6">
              {(() => {
                const editingImage = images.find((img) => img.id === editingImageId);
                if (!editingImage) return null;

                return (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Image actuelle</p>
                      <div className="relative h-48 rounded-md overflow-hidden bg-slate-100">
                        <Image
                          src={editingImage.originalUrl}
                          alt="Image à modifier"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Type actuel:</span>
                        <span className="font-semibold text-slate-900">
                          {getTransformationLabel(editingImage.transformationType, customStyles)}
                        </span>
                      </div>
                    </div>

                    {/* Transformation type selection */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700">Nouveau type de transformation</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {transformationOptions.map((option) => {
                          const Icon = option.icon;
                          const isCurrentType = editingImage.transformationType === option.value;
                          const isSelected = selectedType === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() => setSelectedType(option.value)}
                              disabled={isCurrentType}
                              className={`relative flex items-start gap-4 p-4 rounded-md border-2 text-left transition-all ${
                                isCurrentType
                                  ? "border-slate-300 bg-slate-50 cursor-not-allowed opacity-50"
                                  : isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center ${
                                isCurrentType
                                  ? "bg-slate-200"
                                  : isSelected
                                  ? "bg-blue-500"
                                  : "bg-gradient-to-br from-blue-500 to-indigo-500"
                              }`}>
                                <Icon size={24} className={isCurrentType ? "text-slate-500" : "text-white"} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-bold text-slate-900">{option.label}</h3>
                                  {isCurrentType && (
                                    <span className="text-xs px-2 py-0.5 rounded-sm bg-slate-200 text-slate-600 font-semibold">
                                      Actuel
                                    </span>
                                  )}
                                  {isSelected && !isCurrentType && (
                                    <Check size={16} className="text-blue-600" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Prompt (only for style_personnalise) */}
                    {selectedType === "style_personnalise" && (
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">
                          Décrivez votre style personnalisé
                        </Label>
                        <Textarea
                          placeholder="Ex: Style bohème avec beaucoup de plantes vertes, canapé en velours bleu canard, tapis berbère..."
                          value={customPromptEdit}
                          onChange={(e) => setCustomPromptEdit(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                        <p className="text-xs text-slate-500">
                          Soyez précis pour obtenir les meilleurs résultats
                        </p>
                      </div>
                    )}

                    {/* Furniture Toggle (only if type allows it) */}
                    {(() => {
                      const selectedOption = transformationOptions.find(t => t.value === selectedType);
                      if (selectedOption?.allowFurnitureToggle) {
                        return (
                          <div className="pt-4 border-t border-slate-200 space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">
                              Options de meubles
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                type="button"
                                variant={withFurnitureEdit === true ? "default" : "outline"}
                                onClick={() => setWithFurnitureEdit(true)}
                                className={withFurnitureEdit === true ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                Avec meubles
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                variant={withFurnitureEdit === false ? "default" : "outline"}
                                onClick={() => setWithFurnitureEdit(false)}
                                className={withFurnitureEdit === false ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                Sans meubles
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Info message */}
                    {selectedType && (
                      <div className="flex items-start gap-3 p-4 rounded-md bg-blue-50 border border-blue-200">
                        <Sparkles size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900 mb-1">Regénération nécessaire</p>
                          <p>
                            Une fois validé, l'image reviendra au statut "En attente".
                            Vous devrez cliquer sur "Regénérer" pour obtenir le nouveau résultat.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingImageId(null);
                          setSelectedType(null);
                          setCustomPromptEdit("");
                          setWithFurnitureEdit(undefined);
                        }}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleValidateEdit}
                        disabled={!selectedType || (selectedType === "style_personnalise" && !customPromptEdit.trim())}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Check size={16} className="mr-2" />
                        Valider la modification
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Cette action est irréversible
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              {(() => {
                const imageToDelete = images.find((img) => img.id === deleteConfirmId);
                if (!imageToDelete) return null;

                return (
                  <>
                    <div className="space-y-3">
                      <div className="relative h-32 rounded-md overflow-hidden bg-slate-100">
                        <Image
                          src={imageToDelete.originalUrl}
                          alt="Image à supprimer"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="mb-1">
                          <span className="font-semibold text-slate-900">Type:</span>{" "}
                          {getTransformationLabel(imageToDelete.transformationType, customStyles)}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Statut:</span>{" "}
                          {imageToDelete.status === "completed" && "Terminé"}
                          {imageToDelete.status === "pending" && "En attente"}
                          {imageToDelete.status === "processing" && "En cours"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900">
                        Êtes-vous sûr de vouloir supprimer cette image ? Cette action ne peut pas être annulée.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          deleteImage(deleteConfirmId);
                          setDeleteConfirmId(null);
                        }}
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
