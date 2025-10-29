"use client";

import { Button, PageHeader, StatCard } from "@/components/ui";
import { ProjectCard, EmptyState } from "@/components/projects";
import Link from "next/link";
import {
  FolderOpen,
  Image as ImageIcon,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/use-projects";
import { useCreditStats } from "@/lib/hooks/use-credits";
import { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function DashboardPage() {
  const { isInitialized, user } = useAuthStore();

  // Charger les données réelles seulement si l'auth est initialisée ET qu'on a un user
  const shouldFetch = isInitialized && !!user;

  console.log('🎯 Dashboard render - isInitialized:', isInitialized, 'user:', !!user, 'shouldFetch:', shouldFetch);

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects(shouldFetch);
  const { data: creditStats, isLoading: isLoadingCredits } = useCreditStats();

  // Calculer les stats
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalImages = projects.reduce((sum, p) => sum + (p.total_images || 0), 0);
    const completedImages = projects.reduce((sum, p) => sum + (p.completed_images || 0), 0);

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
        value: creditStats?.total_remaining?.toString() || "0",
        icon: Sparkles,
        change: creditStats?.total_purchased ? `sur ${creditStats.total_purchased}` : "Aucun achat",
        changeType: "neutral" as const,
      },
      {
        name: "Temps moyen",
        value: "2m 47s",
        icon: Clock,
        change: "par image",
        changeType: "neutral" as const,
      },
    ];
  }, [projects, creditStats]);

  // Prendre les 3 projets les plus récents
  const recentProjects = useMemo(() => {
    return projects.slice(0, 3);
  }, [projects]);

  const isLoading = isLoadingProjects || isLoadingCredits;

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
                coverImageUrl={project.cover_image_url}
                totalImages={project.total_images || 0}
                completedImages={project.completed_images || 0}
                updatedAt={project.updated_at}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="Aucun projet"
            description="Créez votre premier projet pour commencer"
            action={{
              label: "Créer un projet",
              onClick: () => window.location.href = '/dashboard/projects/new',
            }}
            className="col-span-full"
          />
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
