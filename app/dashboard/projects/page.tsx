"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  FolderOpen,
  MoreVertical,
  Trash2,
  Edit,
  Download,
} from "lucide-react";

// Mock data
const allProjects = [
  {
    id: "1",
    name: "Villa Moderne - Cannes",
    address: "45 Boulevard de la Croisette, Cannes",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    totalImages: 12,
    completedImages: 8,
    createdAt: "2025-01-15",
    updatedAt: "Il y a 2 heures",
  },
  {
    id: "2",
    name: "Appartement Haussmannien",
    address: "28 Avenue Montaigne, Paris",
    coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    totalImages: 8,
    completedImages: 8,
    createdAt: "2025-01-14",
    updatedAt: "Il y a 5 heures",
  },
  {
    id: "3",
    name: "Loft Industriel",
    address: "12 Rue de la République, Lyon",
    coverImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    totalImages: 15,
    completedImages: 6,
    createdAt: "2025-01-12",
    updatedAt: "Hier",
  },
  {
    id: "4",
    name: "Maison Contemporaine",
    address: "89 Avenue des Champs-Élysées, Paris",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    totalImages: 20,
    completedImages: 20,
    createdAt: "2025-01-10",
    updatedAt: "Il y a 2 jours",
  },
  {
    id: "5",
    name: "Duplex Scandinave",
    address: "34 Rue du Faubourg Saint-Honoré, Paris",
    coverImage: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&q=80",
    totalImages: 10,
    completedImages: 3,
    createdAt: "2025-01-08",
    updatedAt: "Il y a 3 jours",
  },
  {
    id: "6",
    name: "Studio Minimaliste",
    address: "67 Rue de Rivoli, Paris",
    coverImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    totalImages: 6,
    completedImages: 6,
    createdAt: "2025-01-05",
    updatedAt: "Il y a 5 jours",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = allProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes projets</h1>
          <p className="text-slate-600 mt-1">
            {allProjects.length} projet{allProjects.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
            <Plus size={20} className="mr-2" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Rechercher un projet par nom ou adresse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-white border-slate-300 text-slate-900"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="modern-card p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? "Aucun projet ne correspond à votre recherche."
                : "Créez votre premier projet pour commencer."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/projects/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
                  <Plus size={20} className="mr-2" />
                  Créer un projet
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="modern-card overflow-hidden group"
            >
              {/* Cover Image */}
              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer">
                  <Image
                    src={project.coverImage}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 glass text-xs font-semibold text-slate-900">
                    {project.completedImages === project.totalImages ? (
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-sm bg-green-500" />
                        Terminé
                      </span>
                    ) : (
                      `${project.completedImages}/${project.totalImages}`
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="glass hover:bg-white/90"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open menu
                      }}
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                <Link href={`/dashboard/projects/${project.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {project.name}
                  </h3>
                </Link>
                <p className="text-sm text-slate-600 mb-4">{project.address}</p>

                {/* Progress bar */}
                {project.completedImages < project.totalImages && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Progression
                      </span>
                      <span className="text-slate-900 font-semibold">
                        {Math.round(
                          (project.completedImages / project.totalImages) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{
                          width: `${
                            (project.completedImages / project.totalImages) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span>{project.updatedAt}</span>
                  <span>{project.totalImages} images</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
