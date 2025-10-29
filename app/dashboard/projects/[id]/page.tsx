"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Card } from "@/components/ui";
import { ImageUploader } from "@/components/upload/image-uploader";
import { Upload } from "lucide-react";
import type { RoomType } from "@/../types/dashboard";
import { getTransformationLabel } from "@/lib/transformation-types";
import {
  useProject,
  useProjectImages,
  useDeleteImage,
  useDeleteProject,
  useUploadImage,
  useGenerateImage,
  useAllTransformationTypes,
} from "@/lib/hooks";
import type { Image as ImageType } from "@/lib/hooks";
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
} from "@/components/projects";
import { ImageGridCard } from "@/components/projects/molecules/image-grid-card";
import { ImageViewerDialog } from "@/components/projects/molecules/image-viewer-dialog";
import { DeleteConfirmDialog } from "@/components/projects/molecules/delete-confirm-dialog";
import { DeleteProjectDialog } from "@/components/projects/molecules/delete-project-dialog";

interface UploadedFile {
  file: File;
  transformationType: string;
  customPrompt?: string;
  withFurniture?: boolean;
  roomType?: RoomType;
  customRoom?: string; // Valeur personnalisée si roomType === "autre"
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { isInitialized, user } = useAuthStore();

  // Attendre que l'auth soit initialisée avant de charger
  const shouldFetch = isInitialized && !!user;

  console.log('🎬 Project detail page - projectId:', projectId, 'shouldFetch:', shouldFetch, 'user:', user?.id);

  // Fetch real data - Ne charger QUE si l'utilisateur est prêt
  const { data: project, isLoading: isLoadingProject } = useProject(projectId, shouldFetch);
  const { data: images = [], isLoading: isLoadingImages } = useProjectImages(projectId, shouldFetch);
  const { data: dbTransformationTypes = [] } = useAllTransformationTypes(shouldFetch);
  const deleteImageMutation = useDeleteImage();
  const deleteProjectMutation = useDeleteProject();
  const uploadImageMutation = useUploadImage();
  const generateImageMutation = useGenerateImage();

  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "completed" | "pending">("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    try {
      // Upload chaque fichier en parallèle
      await Promise.all(
        uploadedFiles.map((uploadedFile) => {
          // Si roomType est "autre", utiliser customRoom à la place
          const finalRoomType = uploadedFile.roomType === "autre"
            ? uploadedFile.customRoom
            : uploadedFile.roomType;

          return uploadImageMutation.mutateAsync({
            projectId,
            file: uploadedFile.file,
            transformationType: uploadedFile.transformationType,
            customPrompt: uploadedFile.customPrompt,
            withFurniture: uploadedFile.withFurniture,
            roomType: finalRoomType,
          });
        })
      );
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await deleteImageMutation.mutateAsync({ imageId: id, projectId });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Keep modal open so user can retry
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      setDeleteProjectDialogOpen(false);
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
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
      console.error('Error downloading image:', error);
    }
  };

  const handleExportZip = async () => {
    if (!project || !images.length) return;

    setIsExporting(true);

    try {
      const completedImages = images.filter(img => img.status === 'completed' && img.transformed_url);

      if (completedImages.length === 0) {
        toast.error("Aucune image à exporter", {
          description: "Aucune transformation terminée disponible",
        });
        return;
      }

      await downloadImagesAsZip(
        completedImages.map(img => ({
          url: img.transformed_url!,
          filename: `${img.id}.jpg`,
        })),
        {
          projectName: project.name,
          includeOriginals: false,
        },
        (progress) => {
          console.log(`Export progress: ${progress}%`);
        }
      );

      toast.success("Export réussi", {
        description: `${completedImages.length} image${completedImages.length > 1 ? 's' : ''} exportée${completedImages.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Export error:", error);
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
          {filteredImages.map((imagePair) => (
            <ImageGridCard
              key={imagePair.id}
              image={imagePair}
              transformationLabel={getTransformationLabel(
                imagePair.transformation_type,
                dbTransformationTypes
              )}
              projectName={project.name}
              generatingImageId={generatingImageId}
              onView={() => setSelectedImage(imagePair)}
              onDownload={downloadImage}
              onDelete={() => setDeleteConfirmId(imagePair.id)}
              onGenerate={() => {
                setGeneratingImageId(imagePair.id);
                generateImageMutation.mutate(
                  {
                    imageId: imagePair.id,
                    projectId,
                  },
                  {
                    onSettled: () => {
                      setGeneratingImageId(null);
                    },
                  }
                );
              }}
            />
          ))}
        </div>
      ) : viewMode === "all" ? (
        <EmptyState
          title="Aucune image"
          description="Ajoutez vos premières photos pour commencer"
          actionLabel="Ajouter des photos"
          onAction={() => setUploadDialogOpen(true)}
        />
      ) : (
        <Card className="modern-card p-12 text-center">
          <Upload size={48} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Aucune image
          </h3>
          <p className="text-slate-600">
            Aucune image dans la catégorie &ldquo;{viewMode === "completed" ? "Terminées" : "En cours"}&rdquo;
          </p>
        </Card>
      )}

      {/* Image viewer dialog */}
      <ImageViewerDialog
        image={selectedImage}
        transformationLabel={
          selectedImage
            ? getTransformationLabel(
                selectedImage.transformation_type,
                dbTransformationTypes
              )
            : ""
        }
        projectName={project.name}
        onClose={() => setSelectedImage(null)}
        onDownload={downloadImage}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        image={
          deleteConfirmId
            ? images.find((img) => img.id === deleteConfirmId) || null
            : null
        }
        transformationLabel={
          deleteConfirmId
            ? getTransformationLabel(
                images.find((img) => img.id === deleteConfirmId)
                  ?.transformation_type || "",
                dbTransformationTypes
              )
            : ""
        }
        isDeleting={deleteImageMutation.isPending}
        onConfirm={() => deleteImage(deleteConfirmId!)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={project?.name || "Projet"}
        shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/shared/project/${projectId}` : ''}
        isPublic={false}
        onTogglePublic={undefined}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={deleteProjectDialogOpen}
        projectName={project.name}
        totalImages={images.length}
        isDeleting={deleteProjectMutation.isPending}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteProjectDialogOpen(false)}
      />
    </div>
  );
}
