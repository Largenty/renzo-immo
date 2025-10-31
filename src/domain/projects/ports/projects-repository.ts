/**
 * Port : Projects Repository
 * Interface abstraite pour accéder aux projets
 */

import type { Project, CreateProjectInput, UpdateProjectInput, ProjectStats } from '../models/project'

export interface IProjectsRepository {
  /**
   * Récupérer tous les projets d'un utilisateur
   */
  getProjects(userId: string): Promise<Project[]>

  /**
   * Récupérer un projet par ID
   */
  getProjectById(projectId: string, userId: string): Promise<Project | null>

  /**
   * Créer un nouveau projet
   */
  createProject(
    userId: string,
    input: Omit<CreateProjectInput, 'coverImage'> & { coverImageUrl?: string }
  ): Promise<Project>

  /**
   * Mettre à jour un projet
   */
  updateProject(projectId: string, userId: string, input: UpdateProjectInput): Promise<Project>

  /**
   * Supprimer un projet
   */
  deleteProject(projectId: string, userId: string): Promise<void>

  /**
   * Récupérer les statistiques d'un projet
   */
  getProjectStats(projectId: string): Promise<ProjectStats>

  /**
   * Mettre à jour les compteurs d'images
   * ✅ SECURITY: userId requis pour validation RLS
   */
  updateImageCounters(projectId: string, userId: string, totalImages: number, completedImages: number): Promise<void>
}
