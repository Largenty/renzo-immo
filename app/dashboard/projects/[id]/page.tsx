"use client";

import { useState, useMemo } from "react";
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
  furnitureIds?: string[]; // ✅ AJOUTÉ: IDs des meubles sélectionnés
  roomType?: RoomType;
  customRoom?: string; // Valeur personnalisée si roomType === "autre"
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: user } = useCurrentUser();

  logger.debug('🎬 Project detail page - projectId:', projectId, 'user:', user?.id);

  // Fetch real data
  const { data: project, isLoading: isLoadingProject } = useProject(user?.id, projectId);
  const { data: images = [], isLoading: isLoadingImages } = useProjectImages(projectId);
  const { data: transformationTypes = [], isLoading: isLoadingTypes } = useAllTransformationTypes(user?.id);
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
    projectId,
    enabled: true, // Toujours actif quand on est sur la page
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

  const isLoading = isLoadingProject || isLoadingImages;

  const handleUploadComplete = async (uploadedFiles: UploadedFile[]) => {
    if (!user?.id) {
      logger.error("No user ID");
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

          // Si roomType est "autre", utiliser customRoom à la place
          const finalRoomType = uploadedFile.roomType === "autre"
            ? uploadedFile.customRoom
            : uploadedFile.roomType;

          // 🐛 DEBUG: Log des données avant upload
          logger.debug('[Upload] Données envoyées:', {
            transformationType: uploadedFile.transformationType,
            withFurniture: uploadedFile.withFurniture,
            furnitureIds: uploadedFile.furnitureIds,
            furnitureCount: uploadedFile.furnitureIds?.length || 0,
            roomType: finalRoomType,
          });

          return uploadImageMutation.mutateAsync({
            userId: user.id,
            input: {
              projectId,
              file: uploadedFile.file,
              transformationType: uploadedFile.transformationType, // 🔄 Utiliser le slug string
              customPrompt: uploadedFile.customPrompt,
              withFurniture: uploadedFile.withFurniture,
              furnitureIds: uploadedFile.furnitureIds,
              roomType: finalRoomType as any,
            },
          });
        })
      );
      setUploadDialogOpen(false);
    } catch (error) {
      logger.error("Error uploading images:", error);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await deleteImageMutation.mutateAsync({ imageId: id, projectId });
      setDeleteConfirmId(null);
    } catch (error) {
      logger.error("Error deleting image:", error);
      // Keep modal open so user can retry
    }
  };

  const handleDeleteProject = async () => {
    if (!user?.id) return;

    try {
      await deleteProjectMutation.mutateAsync(projectId);
      setDeleteProjectDialogOpen(false);
      router.push("/dashboard/projects");
    } catch (error) {
      logger.error("Error deleting project:", error);
      // Keep modal open so user can retry
    }
  };


  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      logger.error('Error downloading image:', error);
    }
  };

  const handleExportZip = async () => {
    if (!project || !images.length) return;

    setIsExporting(true);

    try {
      const completedImages = images.filter(img => img.status === 'completed' && img.transformedUrl);

      if (completedImages.length === 0) {
        toast.error("Aucune image à exporter", {
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
        description: `${completedImages.length} image${completedImages.length > 1 ? 's' : ''} exportée${completedImages.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      logger.error("Export error:", error);
      toast.error("Erreur lors de l'export", {
        description: "Impossible de générer le fichier ZIP",
      });
    } finally {
      setIsExporting(false);
    }
  };


  // Loading state
  if (isLoading) {
    return <ProjectLoadingSkeleton />;
  }

  // Project not found
  if (!project) {
    return <ProjectNotFound />;
  }

  // Helper pour obtenir le label d'un type de transformation
  const getTransformationLabel = (typeId: string) => {
    const type = transformationTypes.find(t => t.value === typeId);
    return type?.label || typeId;
  };

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
                } catch (error) {
                  logger.error('Error generating image:', error);
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
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
        title={project.name}
      />
    </div>
  );
}
