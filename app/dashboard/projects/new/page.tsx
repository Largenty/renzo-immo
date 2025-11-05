"use client";

import { Button, InfoCard, TipsList, Card } from "@/shared";
import { NewProjectForm } from "@/modules/projects";
import { useCurrentUser } from "@/modules/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";

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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/projects">
          <Button
            variant="ghost"
            className="mb-4 text-slate-600 hover:text-slate-900"
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
      <NewProjectForm />

      {/* Info Box */}
      <InfoCard
        icon={Sparkles}
        title="À savoir"
        description="La photo de couverture sert uniquement à illustrer votre projet. Vous pourrez ajouter vos photos à transformer après la création, dans la page du projet (dépersonnalisation, home staging, rénovation...)."
        variant="blue"
      />

      {/* Tips section */}
      <TipsList title="Conseils pour vos projets" tips={projectTips.map(t => t.text)} />
    </div>
  );
}
