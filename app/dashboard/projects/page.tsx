"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore, useProjectsStore } from "@/lib/stores";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

// Composant de skeleton pour une carte de projet
function ProjectCardSkeleton() {
  return (
    <Card className="modern-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjectsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Charger les projets au montage
  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id, fetchProjects]);

  const isError = !!error;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [projects, searchQuery]);

  // Formater la date relative
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleEditClick = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}/edit`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mes projets</h1>
          <p className="text-slate-600 mt-1">
            {isLoading
              ? "Chargement..."
              : `${projects.length} projet${projects.length > 1 ? "s" : ""} au total`}
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
          disabled={isLoading}
        />
      </div>

      {/* Error State */}
      {isError && (
        <Card className="modern-card p-12 text-center bg-red-50 border-red-200">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-md bg-red-100 flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-red-700 mb-4">
              {error || "Une erreur est survenue lors du chargement des projets."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300"
            >
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && (
        <>
          {filteredProjects.length === 0 ? (
            <Card className="modern-card p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center mb-4">
                  <FolderOpen size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {searchQuery ? "Aucun projet trouvé" : "Commencez par créer un projet"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery
                    ? "Aucun projet ne correspond à votre recherche."
                    : "Organisez vos biens immobiliers et transformez vos photos en un clic."}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/projects/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow">
                      <Plus size={20} className="mr-2" />
                      Créer mon premier projet
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const totalImages = project.totalImages || 0;
                const completedImages = project.completedImages || 0;
                const hasImages = totalImages > 0;
                const progress = hasImages ? (completedImages / totalImages) * 100 : 0;

                return (
                  <Card
                    key={project.id}
                    className="modern-card overflow-hidden group"
                  >
                    {/* Cover Image */}
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer">
                        {project.coverImageUrl ? (
                          <>
                            <Image
                              src={project.coverImageUrl}
                              alt={project.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FolderOpen size={48} className="text-slate-300 transition-colors" />
                          </div>
                        )}

                        {/* Status badge */}
                        {hasImages && (
                          <div className="absolute top-3 right-3 px-3 py-1 glass text-xs font-semibold text-slate-900">
                            {completedImages === totalImages ? (
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-sm bg-green-500" />
                                Terminé
                              </span>
                            ) : (
                              `${completedImages}/${totalImages}`
                            )}
                          </div>
                        )}


                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 transition-colors cursor-pointer">
                          {project.name}
                        </h3>
                      </Link>
                      {project.address && (
                        <p className="text-sm text-slate-600 mb-4">{project.address}</p>
                      )}

                      {/* Progress bar */}
                      {hasImages && completedImages < totalImages && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">
                              Progression
                            </span>
                            <span className="text-slate-900 font-semibold">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                        <span>{getRelativeTime(project.updatedAt)}</span>
                        <span>
                          {totalImages > 0
                            ? `${totalImages} image${totalImages > 1 ? "s" : ""}`
                            : "Aucune image"}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet et toutes ses images seront
              définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
