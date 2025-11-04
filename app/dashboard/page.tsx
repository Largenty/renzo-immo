"use client";

import { Button, PageHeader, StatCard } from "@/presentation/shared/ui";
import { ProjectCard, EmptyState } from "@/presentation/features/projects";
import Link from "next/link";
import {
  FolderOpen,
  Image as ImageIcon,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useProjects } from "@/domain/projects";
import { useCreditStats } from "@/domain/credits";
import { useCurrentUser } from "@/domain/auth";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/presentation/shared/ui/card";

// ✅ Helper: Format date to ISO string
const formatDate = (date: Date | string): string => {
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
};

// ✅ Helper: Format relative time (ex: "Il y a 2 jours")
const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const updatedDate = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - updatedDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    error: projectsError
  } = useProjects(user?.id);
  const {
    data: creditStats,
    isLoading: isLoadingCredits,
    error: creditsError
  } = useCreditStats(user?.id);

  // Calculer les stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalImages = projects.reduce((sum, p) => sum + (p.totalImages || 0), 0);
    const completedImages = projects.reduce((sum, p) => sum + (p.completedImages || 0), 0);

    // ✅ Calculer la dernière activité (projet le plus récemment mis à jour)
    const lastActivity = projects.length > 0
      ? getRelativeTime(projects[0].updatedAt)
      : "Aucune";

    return [
      {
        name: "Projets actifs",
        value: totalProjects.toString(),
        icon: FolderOpen,
        change: `${totalProjects} au total`,
        changeType: "neutral" as const,
      },
      {
        name: "Images générées",
        value: completedImages.toString(),
        icon: ImageIcon,
        change: `${totalImages} au total`,
        changeType: "positive" as const,
      },
      {
        name: "Crédits restants",
        value: creditStats?.totalRemaining?.toString() || "0",
        icon: Sparkles,
        change: creditStats?.totalPurchased ? `sur ${creditStats.totalPurchased}` : "Aucun achat",
        changeType: "neutral" as const,
      },
      {
        name: "Dernière activité",
        value: lastActivity,
        icon: Calendar,
        change: "Mise à jour",
        changeType: "neutral" as const,
      },
    ];
  }, [projects, creditStats]);

  // Prendre les 3 projets les plus récents
  const recentProjects = useMemo(() => {
    return projects.slice(0, 3);
  }, [projects]);

  const isLoading = isLoadingProjects || isLoadingCredits || isLoadingUser;

  // ✅ Loading state pour utilisateur
  if (isLoadingUser) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Gestion du cas utilisateur non connecté
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Non authentifié
          </h3>
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour accéder au tableau de bord.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre espace de travail"
        action={
          <Link href="/dashboard/projects/new">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
              <Plus size={20} className="mr-2" />
              Nouveau projet
            </Button>
          </Link>
        }
      />

      {/* Error States */}
      {(projectsError || creditsError) && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm text-red-600">
                {projectsError instanceof Error && creditsError instanceof Error
                  ? "Impossible de charger les projets et les crédits"
                  : projectsError instanceof Error
                  ? "Impossible de charger les projets"
                  : "Impossible de charger les crédits"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Projets récents</h2>
          <Link href="/dashboard/projects">
            <Button variant="outline" className="text-slate-700">
              Voir tout
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        {isLoadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <StatCard key={i} name="" value="" icon={FolderOpen} loading />
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                address={project.address}
                coverImageUrl={project.coverImageUrl}
                totalImages={project.totalImages || 0}
                completedImages={project.completedImages || 0}
                updatedAt={formatDate(project.updatedAt)}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={FolderOpen}
              title="Aucun projet"
              description="Créez votre premier projet pour commencer"
              action={{
                label: "Créer un projet",
                onClick: () => router.push('/dashboard/projects/new'),
              }}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="modern-card p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Prêt à transformer vos photos ?
            </h3>
            <p className="text-slate-600">
              Créez un nouveau projet et commencez à générer des visuels HD en quelques clics.
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow"
            >
              <Plus size={20} className="mr-2" />
              Créer un projet
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
