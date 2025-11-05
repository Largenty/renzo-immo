/**
 * Service : Récupérer les statistiques des projets
 */

import type { IProjectsRepository } from '../types'
import type { ProjectStats } from '../types'
import { calculateCompletionRate } from '../utils/validate-project'

export class GetProjectStatsService {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  /**
   * Récupérer les statistiques d'un projet
   */
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    return this.projectsRepository.getProjectStats(projectId)
  }

  /**
   * Récupérer le taux de complétion d'un projet
   */
  async getCompletionRate(projectId: string): Promise<number> {
    const stats = await this.projectsRepository.getProjectStats(projectId)
    return calculateCompletionRate(stats.completedImages, stats.totalImages)
  }

  /**
   * Récupérer les statistiques globales de tous les projets d'un utilisateur
   */
  async getUserProjectsStats(userId: string): Promise<{
    totalProjects: number
    totalImages: number
    completedImages: number
    pendingImages: number
  }> {
    const projects = await this.projectsRepository.getProjects(userId)

    const stats = {
      totalProjects: projects.length,
      totalImages: 0,
      completedImages: 0,
      pendingImages: 0,
    }

    for (const project of projects) {
      const projectStats = await this.projectsRepository.getProjectStats(project.id)
      stats.totalImages += projectStats.totalImages
      stats.completedImages += projectStats.completedImages
      stats.pendingImages += projectStats.pendingImages
    }

    return stats
  }
}
