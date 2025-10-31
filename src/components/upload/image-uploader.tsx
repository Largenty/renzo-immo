"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  Check,
  Layers,
  Sofa,
  UtensilsCrossed,
  BedDouble,
  Bath,
  DoorOpen,
  Briefcase,
  Home,
  ArrowRight,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import type { RoomType } from "@/../types/dashboard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAllTransformationTypes } from "@/domain/styles";
import type { TransformationType } from "@/domain/styles/models/transformation-style";
import { useCurrentUser } from "@/domain/auth";
import { compressImage, isValidImageFile, isFileSizeValid, formatFileSize } from "@/lib/image-utils";
import { toast } from "sonner";
import { logger } from '@/lib/logger';
import { FurnitureSelectorDialog } from "@/components/furniture/furniture-selector-dialog";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  transformationType?: TransformationType; // Slug (ex: "home_staging_moderne")
  withFurniture?: boolean;
  furnitureIds?: string[];
  customPrompt?: string;
  roomType?: RoomType;
  customRoom?: string;
}

interface ImageUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  isUploading?: boolean;
}

// Room types with icons
const roomTypes = [
  { value: "salon" as RoomType, label: "Salon", icon: Sofa },
  { value: "cuisine" as RoomType, label: "Cuisine", icon: UtensilsCrossed },
  { value: "chambre" as RoomType, label: "Chambre", icon: BedDouble },
  { value: "salle_de_bain" as RoomType, label: "Salle de bain", icon: Bath },
  { value: "salle_a_manger" as RoomType, label: "Salle à manger", icon: UtensilsCrossed },
  { value: "bureau" as RoomType, label: "Bureau", icon: Briefcase },
  { value: "entree" as RoomType, label: "Entrée", icon: DoorOpen },
  { value: "couloir" as RoomType, label: "Couloir", icon: ArrowRight },
  { value: "autre" as RoomType, label: "Autre", icon: MoreHorizontal },
];

export function ImageUploader({ onUploadComplete, isUploading = false }: ImageUploaderProps) {
  // Auth state
  const { data: user } = useCurrentUser();

  // Fetch transformation types from database
  const { data: transformationTypes = [], isLoading: isLoadingTypes } = useAllTransformationTypes(user?.id);

  // 🐛 DEBUG: Vérifier les types chargés
  logger.debug('🎨 Transformation types loaded:', {
    total: transformationTypes.length,
    custom: transformationTypes.filter(t => (t as any).isCustom).length,
    types: transformationTypes.map(t => ({ value: t.value, label: t.label, isCustom: (t as any).isCustom }))
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "configure">("upload");
  const [bulkMode, setBulkMode] = useState(true); // true = même type pour tout, false = individuel
  const [furnitureDialogOpen, setFurnitureDialogOpen] = useState(false);
  const [currentFileIdForFurniture, setCurrentFileIdForFurniture] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    processFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  }, []);

  const processFiles = async (newFiles: File[]) => {
    // Valider les fichiers
    const validFiles = newFiles.filter((file) => {
      if (!isValidImageFile(file)) {
        toast.error(`Format invalide: ${file.name}`, {
          description: "Formats acceptés : JPG, PNG, WebP",
        });
        return false;
      }

      if (!isFileSizeValid(file, 10)) {
        toast.error(`Fichier trop volumineux: ${file.name}`, {
          description: `Taille: ${formatFileSize(file.size)}. Maximum: 10 MB`,
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Afficher un toast de progression
    const toastId = toast.loading(
      `Compression de ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}...`,
      { duration: Infinity }
    );

    try {
      // Compresser les images en parallèle
      const compressionResults = await Promise.all(
        validFiles.map(async (file) => {
          try {
            // Compresser l'image
            const compressed = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85,
              format: 'jpeg',
            });

            logger.debug(
              `✅ ${file.name}: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${compressed.compressionRatio}% réduit)`
            );

            return {
              id: Math.random().toString(36).substr(2, 9),
              file: compressed.file,
              preview: URL.createObjectURL(compressed.file),
              transformationType: "depersonnalisation" as TransformationType,
              originalSize: compressed.originalSize,
              compressedSize: compressed.compressedSize,
            };
          } catch (error) {
            logger.error(`❌ Erreur compression ${file.name}:`, error);
            // Utiliser l'original si la compression échoue
            return {
              id: Math.random().toString(36).substr(2, 9),
              file,
              preview: URL.createObjectURL(file),
              transformationType: "depersonnalisation" as TransformationType,
            };
          }
        })
      );

      setFiles((prev) => [...prev, ...compressionResults]);

      // Toast de succès
      toast.success(
        `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} prête${validFiles.length > 1 ? 's' : ''}`,
        {
          id: toastId,
          description: `Taille optimisée pour un upload rapide`,
          duration: 4000,
        }
      );

      if (compressionResults.length > 0) {
        setStep("configure");
      }
    } catch (error) {
      logger.error('Erreur lors du traitement des fichiers:', error);
      toast.error("Erreur lors du traitement", {
        id: toastId,
        description: "Certains fichiers n'ont pas pu être traités",
        duration: 4000,
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (filtered.length === 0) {
        setStep("upload");
      }
      return filtered;
    });
  };

  const updateTransformationType = (id: string, type: TransformationType) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, transformationType: type } : f))
    );
  };

  const applyBulkTransformationType = (type: TransformationType) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, transformationType: type }))
    );
  };

  const toggleFurniture = async (id: string, withFurniture: boolean) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, withFurniture } : f))
    );

    // 🎯 AUTO-LOAD: Si "avec meubles" activé, charger le preset par défaut
    if (withFurniture) {
      const file = files.find(f => f.id === id);
      if (file?.transformationType && file?.roomType) {
        try {
          logger.debug('[ImageUploader] Auto-loading furniture preset for file:', {
            fileId: id,
            transformationType: file.transformationType,
            roomType: file.roomType,
          });

          const params = new URLSearchParams({
            transformationTypeId: file.transformationType, // Utiliser le slug
            roomType: file.roomType,
          });

          const response = await fetch(`/api/furniture/preset?${params}`);
          if (response.ok) {
            const data = await response.json();
            const furnitureIds = data.furnitureIds || [];

            logger.debug('[ImageUploader] Preset loaded:', {
              furnitureCount: furnitureIds.length,
              furnitureIds,
            });

            if (furnitureIds.length > 0) {
              updateFurnitureIds(id, furnitureIds);
              toast.success('Meubles par défaut ajoutés', {
                description: `${furnitureIds.length} meubles sélectionnés automatiquement`,
              });
            }
          }
        } catch (error) {
          logger.error('[ImageUploader] Error loading furniture preset:', error);
          // Silent fail - l'utilisateur peut toujours personnaliser manuellement
        }
      }
    }
  };

  const applyBulkFurniture = async (withFurniture: boolean) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, withFurniture }))
    );

    // 🎯 AUTO-LOAD: Si "avec meubles" activé, charger le preset par défaut
    if (withFurniture && files[0]?.transformationType && files[0]?.roomType) {
      try {
        logger.debug('[ImageUploader] Auto-loading furniture preset:', {
          transformationType: files[0].transformationType,
          roomType: files[0].roomType,
        });

        const params = new URLSearchParams({
          transformationTypeId: files[0].transformationType, // Utiliser le slug
          roomType: files[0].roomType,
        });

        const response = await fetch(`/api/furniture/preset?${params}`);
        if (response.ok) {
          const data = await response.json();
          const furnitureIds = data.furnitureIds || [];

          logger.debug('[ImageUploader] Preset loaded:', {
            furnitureCount: furnitureIds.length,
            furnitureIds,
          });

          if (furnitureIds.length > 0) {
            applyBulkFurnitureIds(furnitureIds);
            toast.success('Meubles par défaut ajoutés', {
              description: `${furnitureIds.length} meubles sélectionnés automatiquement`,
            });
          }
        }
      } catch (error) {
        logger.error('[ImageUploader] Error loading furniture preset:', error);
        // Silent fail - l'utilisateur peut toujours personnaliser manuellement
      }
    }
  };

  const updateCustomPrompt = (id: string, customPrompt: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customPrompt } : f))
    );
  };

  const applyBulkCustomPrompt = (customPrompt: string) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, customPrompt }))
    );
  };

  const updateRoomType = (id: string, roomType: RoomType) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, roomType, customRoom: roomType === "autre" ? f.customRoom : undefined } : f))
    );
  };

  const applyBulkRoomType = (roomType: RoomType) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, roomType, customRoom: roomType === "autre" ? f.customRoom : undefined }))
    );
  };

  const updateCustomRoom = (id: string, customRoom: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, customRoom } : f))
    );
  };

  const applyBulkCustomRoom = (customRoom: string) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, customRoom }))
    );
  };

  const updateFurnitureIds = (id: string, furnitureIds: string[]) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, furnitureIds } : f))
    );
  };

  const applyBulkFurnitureIds = (furnitureIds: string[]) => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, furnitureIds }))
    );
  };

  const openFurnitureSelector = (fileId: string | null = null) => {
    // 🐛 DEBUG: Log l'ouverture du dialogue
    logger.debug('[ImageUploader] Opening furniture selector:', {
      fileId,
      mode: fileId ? 'individual' : 'bulk',
      hasTransformationType: !!files[0]?.transformationType,
      transformationType: files[0]?.transformationType,
      hasRoomType: !!files[0]?.roomType,
      roomType: files[0]?.roomType,
    });

    setCurrentFileIdForFurniture(fileId);
    setFurnitureDialogOpen(true);
  };

  const handleFurnitureSelect = (furnitureIds: string[]) => {
    // 🐛 DEBUG: Log la sélection de meubles
    logger.debug('[ImageUploader] Furniture selected:', {
      furnitureCount: furnitureIds.length,
      furnitureIds,
      mode: currentFileIdForFurniture ? 'individual' : 'bulk',
      fileId: currentFileIdForFurniture,
    });

    if (currentFileIdForFurniture) {
      // Mode individuel - mettre à jour un seul fichier
      updateFurnitureIds(currentFileIdForFurniture, furnitureIds);
    } else {
      // Mode bulk - mettre à jour tous les fichiers
      applyBulkFurnitureIds(furnitureIds);
    }
  };

  const handleSubmit = () => {
    // 🐛 DEBUG: Log avant submission finale
    logger.debug('[ImageUploader] Submitting files:', {
      fileCount: files.length,
      files: files.map(f => ({
        id: f.id,
        name: f.file.name,
        transformationType: f.transformationType,
        withFurniture: f.withFurniture,
        furnitureIds: f.furnitureIds,
        furnitureCount: f.furnitureIds?.length || 0,
        roomType: f.roomType,
        customRoom: f.customRoom,
      })),
    });

    onUploadComplete?.(files);
  };

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <>
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-md p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-md flex items-center justify-center mb-4 transition-colors ${
                    isDragging
                      ? "bg-blue-500"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}
                >
                  <Upload className="text-white" size={32} />
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  {isDragging
                    ? "Déposez vos fichiers ici"
                    : "Glissez vos photos ici"}
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <ImageIcon size={14} />
                    PNG, JPG, WEBP
                  </span>
                  <span>•</span>
                  <span>Jusqu&apos;à 10MB par image</span>
                  <span>•</span>
                  <span>Plusieurs fichiers acceptés</span>
                </div>
              </div>
            </label>
          </div>

          {/* Quick Tips */}
          <Card className="bg-blue-50 border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">
                  Conseils pour de meilleurs résultats
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Utilisez des photos bien éclairées et nettes</li>
                  <li>• Évitez les images floues ou trop sombres</li>
                  <li>• Privilégiez les angles larges pour une meilleure transformation</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {step === "configure" && files.length > 0 && (
        <>
          {/* Hidden input for adding more files */}
          <input
            type="file"
            id="file-upload-more"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {files.length} photo{files.length > 1 ? "s" : ""} sélectionnée{files.length > 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-slate-600">
                Choisissez le type de transformation pour {bulkMode ? "toutes les" : "chaque"} photo{files.length > 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("file-upload-more") as HTMLInputElement;
                input?.click();
              }}
            >
              <Upload size={16} className="mr-2" />
              Ajouter plus
            </Button>
          </div>

          {/* Mode Toggle */}
          {files.length > 1 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
              <Layers size={18} className="text-slate-600" />
              <span className="text-sm text-slate-700 font-medium flex-1">
                Configuration :
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={bulkMode ? "default" : "outline"}
                  onClick={() => setBulkMode(true)}
                  className={bulkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Même type pour toutes
                </Button>
                <Button
                  size="sm"
                  variant={!bulkMode ? "default" : "outline"}
                  onClick={() => setBulkMode(false)}
                  className={!bulkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Personnaliser
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Mode - Selector for all */}
          {bulkMode && (
            <>
              <Card className="modern-card p-6">
                <div className="space-y-4">
                  <Label className="text-base text-slate-900 font-bold">
                    Type de transformation pour {files.length === 1 ? "cette photo" : "toutes les photos"}
                  </Label>

                  {/* Styles par défaut */}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Styles par défaut</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {transformationTypes.filter(t => !t.isCustom).map((type) => {
                        const Icon = type.icon;
                        const isSelected = files[0]?.transformationType === type.value;

                        return (
                          <button
                            key={type.value}
                            onClick={() => applyBulkTransformationType(type.value)}
                            className={`relative p-4 rounded-md border-2 text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "bg-blue-500" : "bg-slate-100"
                              }`}>
                                <Icon
                                  size={24}
                                  className={isSelected ? "text-white" : "text-slate-600"}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                                  {type.label}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  {type.description}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0 self-start">
                                  <Check className="text-white" size={16} />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Styles personnalisés */}
                  {transformationTypes.filter(t => t.isCustom).length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Mes styles personnalisés</p>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {transformationTypes.filter(t => t.isCustom).map((type) => {
                          const Icon = type.icon;
                          const isSelected = files[0]?.transformationType === type.value;

                          return (
                            <button
                              key={type.value}
                              onClick={() => applyBulkTransformationType(type.value)}
                              className={`relative p-4 rounded-md border-2 text-left transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                              }`}
                            >
                              <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-blue-500" : "bg-gradient-to-br from-blue-500 to-indigo-500"
                                }`}>
                                  <Icon
                                    size={24}
                                    className="text-white"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                                    {type.label}
                                  </p>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {type.description}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0 self-start">
                                    <Check className="text-white" size={16} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Furniture Toggle (only if type allows it) */}
                  {(() => {
                    const selectedType = transformationTypes.find(t => t.value === files[0]?.transformationType);
                    if (selectedType?.allowFurnitureToggle) {
                      return (
                        <div className="pt-4 border-t border-slate-200">
                          <Label className="text-sm text-slate-700 font-semibold mb-3 block">
                            Options de meubles
                          </Label>
                          <div className="flex gap-2 mb-3">
                            <Button
                              size="sm"
                              variant={files[0]?.withFurniture === true ? "default" : "outline"}
                              onClick={() => applyBulkFurniture(true)}
                              className={files[0]?.withFurniture === true ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                              Avec meubles
                            </Button>
                            <Button
                              size="sm"
                              variant={files[0]?.withFurniture === false ? "default" : "outline"}
                              onClick={() => applyBulkFurniture(false)}
                              className={files[0]?.withFurniture === false ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                              Sans meubles
                            </Button>
                          </div>
                          {files[0]?.withFurniture === true && files[0]?.roomType && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openFurnitureSelector(null)}
                              className="w-full gap-2"
                            >
                              <Sofa size={16} />
                              Personnaliser les meubles
                              {files[0]?.furnitureIds && files[0].furnitureIds.length > 0 && (
                                <span className="ml-auto text-xs text-blue-600">
                                  ({files[0].furnitureIds.length} sélectionnés)
                                </span>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Custom Prompt (only for style_personnalise) */}
                  {files[0]?.transformationType === "style_personnalise" && (
                    <div className="pt-4 border-t border-slate-200">
                      <Label className="text-sm text-slate-700 font-semibold mb-2 block">
                        Décrivez votre style personnalisé
                      </Label>
                      <Textarea
                        placeholder="Ex: Style bohème avec beaucoup de plantes vertes, canapé en velours bleu canard, tapis berbère..."
                        value={files[0]?.customPrompt || ""}
                        onChange={(e) => applyBulkCustomPrompt(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Soyez précis pour obtenir les meilleurs résultats
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Room Type Selector */}
              <Card className="modern-card p-6">
                <div className="space-y-4">
                  <Label className="text-base text-slate-900 font-bold">
                    Type de pièce pour {files.length === 1 ? "cette photo" : "toutes les photos"}
                  </Label>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {roomTypes.map((room) => {
                      const Icon = room.icon;
                      const isSelected = files[0]?.roomType === room.value;

                      return (
                        <button
                          key={room.value}
                          onClick={() => applyBulkRoomType(room.value)}
                          className={`relative p-4 rounded-md border-2 text-left transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-blue-500" : "bg-slate-100"
                            }`}>
                              <Icon
                                size={20}
                                className={isSelected ? "text-white" : "text-slate-600"}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">
                                {room.label}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Check className="text-white" size={14} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Room Input (only for "autre") */}
                  {files[0]?.roomType === "autre" && (
                    <div className="pt-4 border-t border-slate-200">
                      <Label className="text-sm text-slate-700 font-semibold mb-2 block">
                        Précisez le type de pièce
                      </Label>
                      <Input
                        placeholder="Ex: Véranda, Cave, Garage..."
                        value={files[0]?.customRoom || ""}
                        onChange={(e) => applyBulkCustomRoom(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Preview all files */}
              {files.length >= 1 && (
                <Card className="modern-card p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Aperçu {files.length === 1 ? "de la photo" : `des photos (${files.length})`}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {files.map((file, index) => (
                      <div key={file.id} className="relative aspect-square rounded-md overflow-hidden bg-slate-100 group">
                        <Image
                          src={file.preview}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeFile(file.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-sm bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Individual Mode - List of files */}
          {!bulkMode && (
            <div className="space-y-6">
              {files.map((uploadedFile, index) => (
                <Card key={uploadedFile.id} className="modern-card overflow-hidden">
                  {/* Image Preview */}
                  <div className="relative h-64 bg-slate-100">
                    <Image
                      src={uploadedFile.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="absolute top-3 right-3 glass hover:bg-white/90 text-slate-700 hover:text-red-600"
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  {/* Info & Type Selector */}
                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-base font-bold text-slate-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    {/* Transformation Type Options */}
                    <div className="space-y-4">
                      <Label className="text-base text-slate-900 font-bold">
                        Type de transformation
                      </Label>

                      {/* Styles par défaut */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">Styles par défaut</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {transformationTypes.filter(t => !t.isCustom).map((type) => {
                            const Icon = type.icon;
                            const isSelected = uploadedFile.transformationType === type.value;

                            return (
                              <button
                                key={type.value}
                                onClick={() => updateTransformationType(uploadedFile.id, type.value)}
                                className={`relative p-4 rounded-md border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? "bg-blue-500" : "bg-slate-100"
                                  }`}>
                                    <Icon
                                      size={24}
                                      className={isSelected ? "text-white" : "text-slate-600"}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                                      {type.label}
                                    </p>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {type.description}
                                    </p>
                                  </div>

                                  {isSelected && (
                                    <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0 self-start">
                                      <Check className="text-white" size={16} />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Styles personnalisés */}
                      {transformationTypes.filter(t => t.isCustom).length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-sm font-semibold text-slate-700 mb-3">Mes styles personnalisés</p>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {transformationTypes.filter(t => t.isCustom).map((type) => {
                              const Icon = type.icon;
                              const isSelected = uploadedFile.transformationType === type.value;

                              return (
                                <button
                                  key={type.value}
                                  onClick={() => updateTransformationType(uploadedFile.id, type.value)}
                                  className={`relative p-4 rounded-md border-2 text-left transition-all ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 shadow-md"
                                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                                  }`}
                                >
                                  <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? "bg-blue-500" : "bg-gradient-to-br from-blue-500 to-indigo-500"
                                    }`}>
                                      <Icon
                                        size={24}
                                        className="text-white"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                                        {type.label}
                                      </p>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                        {type.description}
                                      </p>
                                    </div>

                                    {isSelected && (
                                      <div className="w-6 h-6 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0 self-start">
                                        <Check className="text-white" size={16} />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Furniture Toggle (only if type allows it) */}
                    {(() => {
                      const selectedType = transformationTypes.find(t => t.value === uploadedFile.transformationType);
                      if (selectedType?.allowFurnitureToggle) {
                        return (
                          <div className="pt-4 border-t border-slate-200 space-y-3">
                            <Label className="text-sm text-slate-700 font-semibold">
                              Options de meubles
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={uploadedFile.withFurniture === true ? "default" : "outline"}
                                onClick={() => toggleFurniture(uploadedFile.id, true)}
                                className={uploadedFile.withFurniture === true ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                Avec meubles
                              </Button>
                              <Button
                                size="sm"
                                variant={uploadedFile.withFurniture === false ? "default" : "outline"}
                                onClick={() => toggleFurniture(uploadedFile.id, false)}
                                className={uploadedFile.withFurniture === false ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                Sans meubles
                              </Button>
                            </div>
                            {uploadedFile.withFurniture === true && uploadedFile.roomType && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openFurnitureSelector(uploadedFile.id)}
                                className="w-full gap-2"
                              >
                                <Sofa size={16} />
                                Personnaliser les meubles
                                {uploadedFile.furnitureIds && uploadedFile.furnitureIds.length > 0 && (
                                  <span className="ml-auto text-xs text-blue-600">
                                    ({uploadedFile.furnitureIds.length} sélectionnés)
                                  </span>
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Custom Prompt (only for style_personnalise) */}
                    {uploadedFile.transformationType === "style_personnalise" && (
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        <Label className="text-sm text-slate-700 font-semibold">
                          Décrivez votre style personnalisé
                        </Label>
                        <Textarea
                          placeholder="Ex: Style bohème avec beaucoup de plantes vertes, canapé en velours bleu canard, tapis berbère..."
                          value={uploadedFile.customPrompt || ""}
                          onChange={(e) => updateCustomPrompt(uploadedFile.id, e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                        <p className="text-xs text-slate-500">
                          Soyez précis pour obtenir les meilleurs résultats
                        </p>
                      </div>
                    )}

                    {/* Room Type Selector */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <Label className="text-sm text-slate-700 font-semibold">
                        Type de pièce
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {roomTypes.map((room) => {
                          const Icon = room.icon;
                          const isSelected = uploadedFile.roomType === room.value;

                          return (
                            <button
                              key={room.value}
                              onClick={() => updateRoomType(uploadedFile.id, room.value)}
                              className={`relative p-3 rounded-md border-2 text-left transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-blue-500" : "bg-slate-100"
                                }`}>
                                  <Icon
                                    size={16}
                                    className={isSelected ? "text-white" : "text-slate-600"}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900">
                                    {room.label}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="w-4 h-4 rounded-sm bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Check className="text-white" size={12} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Room Input (only for "autre") */}
                      {uploadedFile.roomType === "autre" && (
                        <div className="pt-2">
                          <Input
                            placeholder="Ex: Véranda, Cave, Garage..."
                            value={uploadedFile.customRoom || ""}
                            onChange={(e) => updateCustomRoom(uploadedFile.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([]);
                setStep("upload");
              }}
              className="flex-1"
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Ajouter {files.length} photo{files.length > 1 ? "s" : ""} au projet
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Furniture Selector Dialog */}
      {furnitureDialogOpen && files[0]?.transformationType && files[0]?.roomType && (
        <FurnitureSelectorDialog
          open={furnitureDialogOpen}
          onOpenChange={setFurnitureDialogOpen}
          transformationTypeId={files[0].transformationType}
          roomType={files[0].roomType}
          onSelect={handleFurnitureSelect}
          initialSelection={
            currentFileIdForFurniture
              ? files.find(f => f.id === currentFileIdForFurniture)?.furnitureIds
              : files[0]?.furnitureIds
          }
        />
      )}
    </div>
  );
}
