"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCreateProjectWithCover } from "@/lib/hooks";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  ProjectForm,
  type ProjectFormData,
} from "@/components/projects/project-form";
import { InfoCard } from "@/components/dashboard/atoms/info-card";
import { TipsList } from "@/components/dashboard/molecules/tips-list";

const projectTips = [
  {
    text: "Ajoutez plusieurs angles de chaque pièce pour de meilleurs résultats",
  },
  {
    text: "Privilégiez des photos bien éclairées et en haute résolution",
  },
  {
    text: "Vous pourrez ajouter d'autres images à tout moment après la création",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProjectWithCover();

  const handleSubmit = async (data: ProjectFormData, coverImage: File | null) => {
    console.log("🚀 Creating project...", {
      name: data.name,
      hasCover: !!coverImage,
    });

    try {
      const result = await createProject.mutateAsync({
        project: {
          name: data.name,
          address: data.address || undefined,
          description: data.description || undefined,
        },
        coverImage: coverImage || undefined,
      });

      console.log("✅ Project created successfully:", result);
      console.log("📍 Redirecting to /dashboard/projects");
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("❌ Error creating project:", error);
    }
  };

  const isLoading = createProject.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects">
          <Button
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
            disabled={isLoading}
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour aux projets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Créer un nouveau projet
        </h1>
        <p className="text-slate-600 mt-1">
          Ajoutez les informations du projet et vos premières images
        </p>
      </div>

      {/* Form */}
      <ProjectForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Info Box */}
      <InfoCard
        icon={Sparkles}
        title="À savoir"
        description="La photo de couverture sert uniquement à illustrer votre projet. Vous pourrez ajouter vos photos à transformer après la création, dans la page du projet (dépersonnalisation, home staging, rénovation...)."
        variant="blue"
      />

      {/* Tips */}
      <TipsList title="Conseils pour vos projets" tips={projectTips} />
    </div>
  );
}
