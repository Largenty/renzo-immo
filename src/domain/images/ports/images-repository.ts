/**
 * Port : Images Repository
 * Interface abstraite pour accéder aux images
 */

import type { Image, UpdateImageInput, ImageStatus } from '../models/image'

export interface IImagesRepository {
  /**
   * Récupérer toutes les images d'un projet
   */
  getProjectImages(projectId: string): Promise<Image[]>

  /**
   * Récupérer une image par ID
   */
  getImageById(imageId: string): Promise<Image | null>

  /**
   * Créer une nouvelle image
   */
  createImage(image: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>): Promise<Image>

  /**
   * Mettre à jour une image
   */
  updateImage(imageId: string, updates: Partial<UpdateImageInput>): Promise<Image>

  /**
   * Supprimer une image
   */
  deleteImage(imageId: string): Promise<void>

  /**
   * Mettre à jour le statut d'une image
   */
  updateImageStatus(
    imageId: string,
    status: ImageStatus,
    errorMessage?: string
  ): Promise<void>

  /**
   * Mettre à jour l'URL de l'image transformée
   */
  updateTransformedUrl(imageId: string, transformedUrl: string): Promise<void>

  /**
   * Marquer une image comme en cours de traitement
   */
  markAsProcessing(imageId: string): Promise<void>

  /**
   * Marquer une image comme terminée
   */
  markAsCompleted(imageId: string, transformedUrl: string, durationMs: number): Promise<void>

  /**
   * Marquer une image comme échouée
   */
  markAsFailed(imageId: string, errorMessage: string): Promise<void>
}
