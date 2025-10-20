"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Mock data
const stats = [
  {
    name: "Projets actifs",
    value: "12",
    icon: FolderOpen,
    change: "+3 ce mois",
    changeType: "positive",
  },
  {
    name: "Images générées",
    value: "248",
    icon: ImageIcon,
    change: "+42 ce mois",
    changeType: "positive",
  },
  {
    name: "Crédits restants",
    value: "48",
    icon: Sparkles,
    change: "sur 100",
    changeType: "neutral",
  },
  {
    name: "Temps moyen",
    value: "2m 47s",
    icon: Clock,
    change: "-15s ce mois",
    changeType: "positive",
  },
];

const recentProjects = [
  {
    id: "1",
    name: "Villa Moderne - Cannes",
    address: "45 Boulevard de la Croisette, Cannes",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    totalImages: 12,
    completedImages: 8,
    updatedAt: "Il y a 2 heures",
  },
  {
    id: "2",
    name: "Appartement Haussmannien",
    address: "28 Avenue Montaigne, Paris",
    coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    totalImages: 8,
    completedImages: 8,
    updatedAt: "Il y a 5 heures",
  },
  {
    id: "3",
    name: "Loft Industriel",
    address: "12 Rue de la République, Lyon",
    coverImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    totalImages: 15,
    completedImages: 6,
    updatedAt: "Hier",
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600 mt-1">
            Bienvenue sur votre espace de travail
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
            <Plus size={20} className="mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="modern-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <stat.icon className="text-white" size={20} />
              </div>
              {stat.changeType === "positive" && (
                <TrendingUp size={16} className="text-green-600" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600 font-medium">{stat.name}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p
                className={`text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-slate-500"
                }`}
              >
                {stat.change}
              </p>
            </div>
          </Card>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="modern-card overflow-hidden group cursor-pointer">
                {/* Cover Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <Image
                    src={project.coverImage}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent" />

                  {/* Progress badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 glass text-xs font-semibold text-slate-900">
                    {project.completedImages}/{project.totalImages} images
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{project.address}</p>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Progression</span>
                      <span className="text-slate-900 font-semibold">
                        {Math.round((project.completedImages / project.totalImages) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{
                          width: `${(project.completedImages / project.totalImages) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{project.updatedAt}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
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
