"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/presentation/shared/ui/button";
import { useCreateProject } from "@/domain/projects";
import { useCurrentUser } from "@/domain/auth";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  ProjectForm,
  type ProjectFormData,
} from "@/presentation/features/projects/project-form";
import { InfoCard } from "@/presentation/features/dashboard/atoms/info-card";
import { TipsList } from "@/presentation/features/dashboard/molecules/tips-list";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Card } from "@/presentation/shared/ui/card";

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
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const createProject = useCreateProject(user?.id);

  const handleSubmit = async (
    data: ProjectFormData,
    coverImage: File | null
  ) => {
    if (!user?.id) {
      logger.error("❌ No user ID");
      toast.error("Vous devez être connecté pour créer un projet");
      return;
    }

    logger.debug("🚀 Creating project...", {
      name: data.name,
      hasCover: !!coverImage,
    });

    const toastId = toast.loading("Création du projet...");

    try {
      await createProject.mutateAsync({
        name: data.name,
        address: data.address || undefined,
        description: data.description || undefined,
        coverImage: coverImage || undefined,
      });

      // ✅ Replace loading toast with success
      toast.success("Projet créé avec succès", { id: toastId });
      logger.debug("✅ Project created successfully");
      logger.debug("📍 Redirecting to /dashboard/projects");

      // ✅ Redirection seulement si succès (mutateAsync throw en cas d'erreur)
      router.push("/dashboard/projects");
    } catch (error) {
      // ✅ Dismiss loading toast (l'erreur est déjà gérée par le hook avec toast)
      toast.dismiss(toastId);
      logger.error("❌ Error creating project:", error);
    }
  };

  // ✅ Loading skeleton pendant le chargement utilisateur
  if (isLoadingUser) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-96 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
        {/* Form skeleton */}
        <div className="h-96 bg-slate-200 rounded animate-pulse" />
        {/* Info card skeleton */}
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
        {/* Tips skeleton */}
        <div className="h-48 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  // ✅ Gestion du cas utilisateur non connecté
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Non authentifié
          </h3>
          <p className="mb-4 text-slate-600">
            Vous devez être connecté pour créer un projet.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  // ✅ Loading state simplifié (après early returns, isLoadingUser est toujours false)
  const isSubmitting = createProject.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects">
          <Button
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour aux projets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">
          Créer un nouveau projet
        </h1>
        <p className="mt-1 text-slate-600">
          Ajoutez les informations du projet et vos premières images
        </p>
      </div>

      {/* Form */}
      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

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
