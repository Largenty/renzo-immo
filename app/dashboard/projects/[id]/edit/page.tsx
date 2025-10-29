"use client";

import { useRouter, useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/lib/hooks";
import {
  ProjectForm,
  type ProjectFormData,
} from "@/components/projects/project-form";
import { EditProjectHeader } from "@/components/projects/molecules/edit-project-header";
import { EditProjectLoadingState } from "@/components/projects/molecules/edit-project-loading-state";
import { ProjectNotFound } from "@/components/projects/project-not-found";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const updateProjectMutation = useUpdateProject();

  const handleSubmit = async (data: ProjectFormData, coverImage: File | null) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: projectId,
        updates: {
          name: data.name,
          address: data.address || undefined,
          description: data.description || undefined,
        },
      });

      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error updating project:", error);
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
        existingCoverUrl={project.cover_image_url}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
