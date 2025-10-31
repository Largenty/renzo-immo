"use client";

import { useRouter, useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/domain/projects";
import { useCurrentUser } from "@/domain/auth";
import {
  ProjectForm,
  type ProjectFormData,
} from "@/components/projects/project-form";
import { EditProjectHeader } from "@/components/projects/molecules/edit-project-header";
import { EditProjectLoadingState } from "@/components/projects/molecules/edit-project-loading-state";
import { ProjectNotFound } from "@/components/projects/project-not-found";
import { logger } from '@/lib/logger';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: user } = useCurrentUser();

  const { data: project, isLoading: isLoadingProject } = useProject(user?.id, projectId);
  const updateProjectMutation = useUpdateProject(user?.id);

  const handleSubmit = async (data: ProjectFormData, coverImage: File | null) => {
    if (!user?.id) {
      logger.error("❌ No user ID");
      return;
    }

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

      router.push("/dashboard/projects");
    } catch (error) {
      logger.error("Error updating project:", error);
    }
  };

  const isLoading = updateProjectMutation.isPending || isLoadingProject;

  // États de chargement et d'erreur
  if (isLoadingProject) {
    return <EditProjectLoadingState />;
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  // Rendu principal
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <EditProjectHeader isLoading={isLoading} />

      <ProjectForm
        mode="edit"
        initialData={{
          name: project.name || "",
          address: project.address || "",
          description: project.description || "",
        }}
        existingCoverUrl={project.coverImageUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
