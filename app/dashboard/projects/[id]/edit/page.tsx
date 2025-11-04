"use client";

import { useRouter, useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/domain/projects";
import { useCurrentUser } from "@/domain/auth";
import {
  ProjectForm,
  type ProjectFormData,
} from "@/presentation/features/projects/project-form";
import { EditProjectHeader } from "@/presentation/features/projects/molecules/edit-project-header";
import { EditProjectLoadingState } from "@/presentation/features/projects/molecules/edit-project-loading-state";
import { ProjectNotFound } from "@/presentation/features/projects/project-not-found";
import { logger } from '@/lib/logger';
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : null;
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const { 
    data: project, 
    isLoading: isLoadingProject,
    error: projectError 
  } = useProject(user?.id, projectId);
  const updateProjectMutation = useUpdateProject(user?.id);

  const handleSubmit = async (data: ProjectFormData, coverImage: File | null) => {
    if (!user?.id) {
      logger.error("❌ No user ID");
      toast.error("Vous devez être connecté pour modifier un projet");
      return;
    }

    if (!projectId) {
      logger.error("❌ Invalid project ID");
      toast.error("ID de projet invalide");
      return;
    }

    const toastId = toast.loading("Mise à jour du projet...");

    try {
      await updateProjectMutation.mutateAsync({
        projectId,
        input: {
          name: data.name,
          address: data.address || undefined,
          description: data.description || undefined,
        },
        coverImage: coverImage || undefined,
      });

      toast.success("Projet mis à jour avec succès", { id: toastId });
      router.push("/dashboard/projects");
    } catch (error) {
      // Dismiss loading toast (l'erreur est déjà gérée par le hook)
      toast.dismiss(toastId);
      logger.error("Update failed:", error);
    }
  };

  // ✅ Gestion des cas d'erreur
  if (!projectId) {
    return (
      <div className="max-w-3xl mx-auto">
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
      <div className="max-w-3xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Non authentifié
          </h3>
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour modifier ce projet.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  // États de chargement
  if (isLoadingUser || isLoadingProject) {
    return <EditProjectLoadingState />;
  }

  // ✅ Gestion des erreurs de chargement
  if (projectError) {
    return (
      <div className="max-w-3xl mx-auto">
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

  // ✅ Projet non trouvé (ou utilisateur non autorisé)
  if (!project) {
    return <ProjectNotFound />;
  }

  // Loading state pour le rendu (mutation en cours)
  const isSubmitting = updateProjectMutation.isPending;

  // Rendu principal
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <EditProjectHeader isLoading={isSubmitting} />

      <ProjectForm
        mode="edit"
        initialData={{
          name: project.name ?? "",
          address: project.address ?? "",
          description: project.description ?? "",
        }}
        existingCoverUrl={project.coverImageUrl ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
