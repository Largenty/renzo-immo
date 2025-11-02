"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/domain/auth";
import { useProject, useDeleteProject } from "@/domain/projects";
import { useProjectImages, useDeleteImage, useUploadImage, useGenerateImage, useImagePolling } from "@/domain/images";
import { useAllTransformationTypes } from "@/domain/styles";
import { Card } from "@/components/ui";
import { ImageUploader } from "@/components/upload/image-uploader";
import { Upload } from "lucide-react";
import type { RoomType } from "@/../types/dashboard";
import type { Image as ImageType } from "@/domain/images";
import { downloadImagesAsZip } from "@/lib/export-utils";
import { ShareDialog } from "@/components/ui/share-dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProjectHeader,
  ProjectStats,
  ImageFilters,
  EmptyState,
  ProjectNotFound,
  ProjectLoadingSkeleton,
  ProjectCoverBanner,
} from "@/components/projects";
import { ImageGridCard } from "@/components/projects/molecules/image-grid-card";
import { ImageViewerDialog } from "@/components/projects/molecules/image-viewer-dialog";
import { DeleteConfirmDialog } from "@/components/projects/molecules/delete-confirm-dialog";
import { DeleteProjectDialog } from "@/components/projects/molecules/delete-project-dialog";
import { logger } from '@/lib/logger';

interface UploadedFile {
  file: File;
  transformationType?: string; // ⚠️ OPTIONAL: Pour matcher l'interface de ImageUploader
  customPrompt?: string;
  withFurniture?: boolean;
  roomType?: RoomType;
  customRoom?: string; // Valeur personnalisée si roomType === "autre"
  roomWidth?: number;  // 📏 Largeur en mètres
  roomLength?: number; // 📏 Longueur en mètres
  roomArea?: number;   // 📏 Surface en m²
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === "string" ? params.id : null;
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  logger.debug('🎬 Project detail page - projectId:', projectId, 'user:', user?.id);

  // ✅ Fetch real data avec gestion d'erreurs
  const { 
    data: project, 
    isLoading: isLoadingProject,
    error: projectError 
  } = useProject(user?.id, projectId);
  const { 
    data: images = [], 
    isLoading: isLoadingImages,
    error: imagesError 
  } = useProjectImages(projectId || "");
  const { 
    data: transformationTypes = [], 
    isLoading: isLoadingTypes 
  } = useAllTransformationTypes(user?.id);
  const deleteImageMutation = useDeleteImage();
  const deleteProjectMutation = useDeleteProject(user?.id);
  const uploadImageMutation = useUploadImage();
  const generateImageMutation = useGenerateImage();

  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "completed" | "pending">("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Debug: log quand uploadDialogOpen change
  logger.debug('📤 Upload dialog state:', uploadDialogOpen);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ POLLING: Vérifier automatiquement le statut des images en cours de traitement
  const { pollingCount, isPolling } = useImagePolling({
    images,
    projectId: projectId || "",
    enabled: !!projectId, // Seulement si projectId est valide
    interval: 5000, // Vérifier toutes les 5 secondes
  });

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (viewMode === "all") return true;
      if (viewMode === "completed") return img.status === "completed";
      if (viewMode === "pending") return img.status === "pending" || img.status === "processing";
      return true;
    });
  }, [images, viewMode]);

  const stats = useMemo(() => {
    return {
      total: images.length,
      completed: images.filter((i) => i.status === "completed").length,
      processing: images.filter((i) => i.status === "processing").length,
      pending: images.filter((i) => i.status === "pending").length,
    };
  }, [images]);

  // ✅ Séparer loading states: page vs images
  const isLoadingPage = isLoadingProject || isLoadingUser;

  // ✅ Memoize: Handle upload complete
  const handleUploadComplete = useCallback(async (uploadedFiles: UploadedFile[]) => {
    if (!user?.id) {
      logger.error("No user ID");
      toast.error("Vous devez être connecté pour uploader des images");
      return;
    }

    if (!projectId) {
      logger.error("No project ID");
      toast.error("ID de projet invalide");
      return;
    }

    try {
      // Upload chaque fichier en parallèle
      await Promise.all(
        uploadedFiles.map((uploadedFile) => {
          // ✅ VALIDATION: S'assurer que transformationType est défini
          if (!uploadedFile.transformationType) {
            logger.error('[Upload] Missing transformation type for file:', uploadedFile.file.name);
            toast.error('Erreur', {
              description: 'Veuillez sélectionner un style de transformation',
            });
            throw new Error('Missing transformation type');
          }

          // 🐛 DEBUG: Log des données avant upload
          logger.debug('[Upload] Données envoyées:', {
            transformationType: uploadedFile.transformationType,
            withFurniture: uploadedFile.withFurniture,
            roomType: uploadedFile.roomType,
            customRoom: uploadedFile.customRoom,
          });

          return uploadImageMutation.mutateAsync({
            userId: user.id,
            input: {
              projectId,
              file: uploadedFile.file,
              transformationType: uploadedFile.transformationType,
              customPrompt: uploadedFile.customPrompt,
              withFurniture: uploadedFile.withFurniture,
              roomType: uploadedFile.roomType, // ✅ Toujours envoyer le roomType (même "autre")
              customRoom: uploadedFile.roomType === "autre" ? uploadedFile.customRoom : undefined,
              roomWidth: uploadedFile.roomWidth,   // 📏 Dimensions de la pièce
              roomLength: uploadedFile.roomLength, // 📏 Dimensions de la pièce
              roomArea: uploadedFile.roomArea,     // 📏 Dimensions de la pièce
            },
          });
        })
      );
      setUploadDialogOpen(false);
      toast.success(`${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} uploadée${uploadedFiles.length > 1 ? 's' : ''} avec succès`);
    } catch (error) {
      logger.error("Error uploading images:", error);
      // Le hook affiche déjà un toast d'erreur, mais on peut ajouter un message global
      if (error instanceof Error && error.message === 'Missing transformation type') {
        // Erreur déjà gérée individuellement
      } else {
        // ✅ Afficher toast pour les autres erreurs
        toast.error("Erreur lors de l'upload", {
          description: error instanceof Error ? error.message : "Une erreur est survenue",
        });
      }
    }
  }, [user?.id, projectId, uploadImageMutation]);

  // ✅ Memoize: Delete image
  const deleteImage = useCallback(async (id: string) => {
    if (!projectId) {
      toast.error("ID de projet invalide");
      return;
    }

    try {
      await deleteImageMutation.mutateAsync({ imageId: id, projectId });
      setDeleteConfirmId(null);

      // ✅ Fermer le viewer si l'image supprimée est affichée
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }

      // Le hook affiche déjà un toast de succès
    } catch (error) {
      logger.error("Error deleting image:", error);
      // Le hook affiche déjà un toast d'erreur, on garde la modal ouverte pour réessayer
    }
  }, [projectId, deleteImageMutation, selectedImage]);

  // ✅ Memoize: Handle delete project
  const handleDeleteProject = useCallback(async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour supprimer un projet");
      return;
    }

    if (!projectId) {
      toast.error("ID de projet invalide");
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(projectId);
      setDeleteProjectDialogOpen(false);
      router.push("/dashboard/projects");
      // Le hook affiche déjà un toast de succès
    } catch (error) {
      logger.error("Error deleting project:", error);
      // Le hook affiche déjà un toast d'erreur, on garde la modal ouverte pour réessayer
    }
  }, [user?.id, projectId, router, deleteProjectMutation]);

  // ✅ Memoize: Download image
  const downloadImage = useCallback(async (url: string, filename: string) => {
    const toastId = toast.loading("Téléchargement en cours...");

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

      toast.success("Image téléchargée", { id: toastId });
    } catch (error) {
      logger.error('Error downloading image:', error);
      toast.error("Erreur lors du téléchargement", {
        id: toastId,
        description: error instanceof Error ? error.message : "Impossible de télécharger l'image",
      });
    }
  }, []);

  // ✅ Memoize: Handle export ZIP
  const handleExportZip = useCallback(async () => {
    if (!project || !images.length) return;

    const toastId = toast.loading("Préparation de l'export...");
    setIsExporting(true);

    try {
      const completedImages = images.filter(img => img.status === 'completed' && img.transformedUrl);

      if (completedImages.length === 0) {
        toast.error("Aucune image à exporter", {
          id: toastId,
          description: "Aucune transformation terminée disponible",
        });
        return;
      }

      await downloadImagesAsZip(
        completedImages.map(img => ({
          url: img.transformedUrl!,
          filename: `${img.id}.jpg`,
        })),
        {
          projectName: project.name,
          includeOriginals: false,
        },
        (progress) => {
          logger.debug(`Export progress: ${progress}%`);
        }
      );

      toast.success("Export réussi", {
        id: toastId,
        description: `${completedImages.length} image${completedImages.length > 1 ? 's' : ''} exportée${completedImages.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      logger.error("Export error:", error);
      toast.error("Erreur lors de l'export", {
        id: toastId,
        description: "Impossible de générer le fichier ZIP",
      });
    } finally {
      setIsExporting(false);
    }
  }, [project, images]);

  // ✅ Memoize: Helper pour obtenir le label d'un type de transformation
  // ⚠️ IMPORTANT: Must be BEFORE early returns to respect Rules of Hooks
  const getTransformationLabel = useCallback((typeId: string) => {
    const type = transformationTypes.find(t => t.value === typeId);
    return type?.label || typeId;
  }, [transformationTypes]);

  // ✅ Gestion des cas d'erreur
  if (!projectId) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            ID de projet invalide
          </h3>
          <p className="text-slate-600 mb-4">
            L'URL ne contient pas un identifiant de projet valide.
          </p>
          <Button onClick={() => router.push("/dashboard/projects")} variant="outline">
            Retour aux projets
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ Gestion du cas utilisateur non connecté
  if (!user && !isLoadingUser) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Non authentifié
          </h3>
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour accéder à ce projet.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state (seulement projet et user, pas les images)
  if (isLoadingPage) {
    return <ProjectLoadingSkeleton />;
  }

  // ✅ Gestion des erreurs de chargement
  if (projectError) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Erreur lors du chargement
          </h3>
          <p className="text-slate-600 mb-4">
            {projectError instanceof Error
              ? projectError.message
              : "Impossible de charger le projet"}
          </p>
          <Button onClick={() => router.push("/dashboard/projects")} variant="outline">
            Retour aux projets
          </Button>
        </Card>
      </div>
    );
  }

  if (imagesError) {
    logger.error("Error loading images:", imagesError);
    // On continue quand même si le projet est chargé, mais on log l'erreur
  }

  // Project not found (ou utilisateur non autorisé)
  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <ProjectHeader
        projectId={projectId}
        projectName={project.name}
        address={project.address}
        description={project.description}
        isExporting={isExporting}
        canExport={images.filter(img => img.status === 'completed').length > 0}
        onExport={handleExportZip}
        onDelete={() => setDeleteProjectDialogOpen(true)}
        uploadDialogOpen={uploadDialogOpen}
        onUploadDialogChange={setUploadDialogOpen}
        uploadDialogContent={
          <ImageUploader
            onUploadComplete={handleUploadComplete}
            isUploading={uploadImageMutation.isPending}
          />
        }
      />

      {/* Cover Image */}
      <ProjectCoverBanner
        coverImageUrl={project.coverImageUrl}
        projectName={project.name}
      />

      {/* Stats */}
      <ProjectStats {...stats} />

      {/* Filters */}
      <ImageFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
      />

      {/* Images Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <ImageGridCard
              key={image.id}
              image={image}
              transformationLabel={getTransformationLabel(image.transformationType)}
              projectName={project.name}
              generatingImageId={generatingImageId}
              onView={() => setSelectedImage(image)}
              onDownload={downloadImage}
              onDelete={() => setDeleteConfirmId(image.id)}
              onGenerate={async (imageId) => {
                setGeneratingImageId(imageId);
                try {
                  await generateImageMutation.mutateAsync(imageId);
                  // Le hook affiche déjà un toast de succès/info
                } catch (error) {
                  logger.error('Error generating image:', error);
                  // Le hook affiche déjà un toast d'erreur
                } finally {
                  setGeneratingImageId(null);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="modern-card p-12">
          <EmptyState
            icon={Upload}
            title={
              viewMode === "all"
                ? "Aucune image"
                : viewMode === "completed"
                ? "Aucune image terminée"
                : "Aucune image en attente"
            }
            description={
              viewMode === "all"
                ? "Commencez par uploader vos premières images"
                : viewMode === "completed"
                ? "Aucune transformation terminée pour le moment"
                : "Toutes vos images ont été transformées"
            }
            action={
              viewMode === "all"
                ? {
                    label: "Uploader des images",
                    onClick: () => setUploadDialogOpen(true),
                  }
                : undefined
            }
          />
        </Card>
      )}

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <ImageViewerDialog
          image={selectedImage}
          transformationLabel={getTransformationLabel(selectedImage.transformationType)}
          projectName={project.name}
          onClose={() => setSelectedImage(null)}
          onDownload={downloadImage}
        />
      )}

      {/* Delete Image Confirmation */}
      <DeleteConfirmDialog
        image={images.find((img) => img.id === deleteConfirmId) || null}
        transformationLabel={
          deleteConfirmId
            ? getTransformationLabel(
                images.find((img) => img.id === deleteConfirmId)
                  ?.transformationType || ""
              )
            : ""
        }
        isDeleting={deleteImageMutation.isPending}
        onConfirm={() => deleteConfirmId && deleteImage(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={deleteProjectDialogOpen}
        onOpenChange={setDeleteProjectDialogOpen}
        onConfirm={handleDeleteProject}
        isDeleting={deleteProjectMutation.isPending}
        projectName={project.name}
        totalImages={images.length}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={window.location.href}
        title={project.name}
      />
    </div>
  );
}
