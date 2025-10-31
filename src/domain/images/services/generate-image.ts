/**
 * Service : Générer une image avec l'IA
 * Cas d'usage pour la génération de transformations d'images
 */

import type { IImagesRepository } from '../ports/images-repository'
import type { IAIGenerator } from '../ports/ai-generator'
import type { TransformImageResult, RegenerateImageInput } from '../models/image'
import { regenerateImageInputSchema } from '../models/image'
import {
  canRegenerateImage,
  CannotRegenerateImageError,
} from '../business-rules/check-generation-status'

export class GenerateImageService {
  constructor(
    private readonly imagesRepository: IImagesRepository,
    private readonly aiGenerator: IAIGenerator
  ) {}

  /**
   * Générer/Transformer une image avec l'IA
   */
  async generateImage(imageId: string): Promise<TransformImageResult> {
    // 1. Récupérer l'image
    const image = await this.imagesRepository.getImageById(imageId)

    if (!image) {
      throw new Error('Image not found')
    }

    // 2. Vérifier que l'image est en statut "pending"
    if (image.status !== 'pending') {
      throw new Error(`Cannot generate image with status: ${image.status}`)
    }

    // 3. Marquer comme "processing"
    await this.imagesRepository.markAsProcessing(imageId)

    // 4. Lancer la génération IA
    try {
      const result = await this.aiGenerator.generateImage({
        imageId: image.id,
        originalUrl: image.originalUrl,
        transformationType: image.transformationType,
        customPrompt: image.customPrompt,
        withFurniture: image.withFurniture,
        roomType: image.roomType,
      })

      return result
    } catch (error) {
      // Si erreur, marquer comme failed
      await this.imagesRepository.markAsFailed(
        imageId,
        error instanceof Error ? error.message : 'Unknown error'
      )
      throw error
    }
  }

  /**
   * Régénérer une image (changer le type de transformation)
   */
  async regenerateImage(
    imageId: string,
    input: RegenerateImageInput
  ): Promise<TransformImageResult> {
    // 1. Valider l'input
    const validatedInput = regenerateImageInputSchema.parse(input)

    // 2. Récupérer l'image
    const image = await this.imagesRepository.getImageById(imageId)

    if (!image) {
      throw new Error('Image not found')
    }

    // 3. Vérifier que l'image peut être régénérée
    if (!canRegenerateImage(image.status)) {
      throw new CannotRegenerateImageError(image.status)
    }

    // 4. Mettre à jour les paramètres et réinitialiser le statut
    await this.imagesRepository.updateImage(imageId, {
      transformationType: validatedInput.transformationType,
      customPrompt: validatedInput.customPrompt,
    })

    await this.imagesRepository.updateImageStatus(imageId, 'pending')

    // 5. Lancer la génération
    return this.generateImage(imageId)
  }

  /**
   * Vérifier le statut d'une génération en cours
   */
  async checkGenerationStatus(imageId: string, taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    transformedUrl?: string
  }> {
    const result = await this.aiGenerator.checkStatus(imageId, taskId)

    // Mettre à jour le statut en base si nécessaire
    if (result.status === 'completed' && result.transformedUrl) {
      await this.imagesRepository.markAsCompleted(imageId, result.transformedUrl, 0)
    } else if (result.status === 'failed') {
      await this.imagesRepository.markAsFailed(
        imageId,
        result.errorMessage || 'Generation failed'
      )
    }

    return result
  }
}
