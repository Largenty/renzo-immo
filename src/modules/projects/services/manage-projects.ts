/**
 * Service : Gérer les projets
 * Cas d'usage pour CRUD des projets
 */

import type { IProjectsRepository } from '../types'
import type { IProjectStorage } from '../types'
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types'
import { createProjectInputSchema, updateProjectInputSchema } from '../types'
import { canDeleteProject, CannotDeleteProjectError } from '../utils/validate-project'
import { logger } from '@/lib/logger';

export class ManageProjectsService {
  constructor(
    private readonly projectsRepository: IProjectsRepository,
    private readonly projectStorage: IProjectStorage
  ) {}

  /**
   * Récupérer tous les projets d'un utilisateur
   */
  async getProjects(userId: string): Promise<Project[]> {
    return this.projectsRepository.getProjects(userId)
  }

  /**
   * Récupérer un projet par ID
   */
  async getProjectById(projectId: string, userId: string): Promise<Project | null> {
    return this.projectsRepository.getProjectById(projectId, userId)
  }

  /**
   * Créer un nouveau projet
   */
  async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    // 1. Valider l'input
    const validatedInput = createProjectInputSchema.parse(input)

    // 2. Uploader l'image de couverture si fournie
    let coverImageUrl: string | undefined

    if (validatedInput.coverImage) {
      try {
        logger.debug('📸 Uploading cover image...', validatedInput.coverImage.name)
        coverImageUrl = await this.projectStorage.uploadCoverImage(validatedInput.coverImage)
        logger.debug('✅ Cover image uploaded:', coverImageUrl)
      } catch (error) {
        logger.error('❌ Failed to upload cover image:', error)
        // Continue sans la cover image
      }
    }

    // 3. Créer le projet avec l'URL de l'image uploadée
    return this.projectsRepository.createProject(userId, {
      name: validatedInput.name,
      address: validatedInput.address,
      description: validatedInput.description,
      coverImageUrl: coverImageUrl,
    })
  }

  /**
   * Mettre à jour un projet
   */
  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    // 1. Valider l'input
    const validatedInput = updateProjectInputSchema.parse(input)

    // 2. Mettre à jour
    return this.projectsRepository.updateProject(projectId, userId, validatedInput)
  }

  /**
   * Supprimer un projet
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    // 1. Récupérer les stats du projet
    const stats = await this.projectsRepository.getProjectStats(projectId)

    // 2. Vérifier si le projet peut être supprimé
    if (!canDeleteProject(stats.processingImages)) {
      throw new CannotDeleteProjectError(
        `Le projet contient ${stats.processingImages} image(s) en cours de traitement`
      )
    }

    // 3. Supprimer les images du storage
    try {
      await this.projectStorage.deleteProjectImages(projectId)
    } catch (error) {
      logger.error('Failed to delete project images:', error)
      // Continue quand même
    }

    // 4. Supprimer le projet
    return this.projectsRepository.deleteProject(projectId, userId)
  }
}
