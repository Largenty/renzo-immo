/**
 * Service : Gérer les images
 * Cas d'usage pour CRUD des images
 */

import type { IImagesRepository } from '../ports/images-repository'
import type { IImageStorage } from '../ports/image-storage'
import type { Image, UploadImageInput, UpdateImageInput } from '../models/image'
import { uploadImageInputSchema, updateImageInputSchema } from '../models/image'
import { logger } from '@/lib/logger';
import {
  isSupportedImageFormat,
  isValidImageSize,
  InvalidImageFormatError,
  InvalidImageSizeError,
} from '../business-rules/validate-image'

export class ManageImagesService {
  constructor(
    private readonly imagesRepository: IImagesRepository,
    private readonly imageStorage: IImageStorage
  ) {}

  /**
   * Récupérer toutes les images d'un projet
   */
  async getProjectImages(projectId: string): Promise<Image[]> {
    return this.imagesRepository.getProjectImages(projectId)
  }

  /**
   * Récupérer une image par ID
   */
  async getImageById(imageId: string): Promise<Image | null> {
    return this.imagesRepository.getImageById(imageId)
  }

  /**
   * Uploader une nouvelle image
   */
  async uploadImage(userId: string, input: UploadImageInput): Promise<Image> {
    // 1. Valider l'input
    const validatedInput = uploadImageInputSchema.parse(input)

    // 2. Valider le format de l'image
    if (!isSupportedImageFormat(validatedInput.file.type)) {
      throw new InvalidImageFormatError(validatedInput.file.type)
    }

    // 3. Valider la taille de l'image
    if (!isValidImageSize(validatedInput.file.size)) {
      throw new InvalidImageSizeError(validatedInput.file.size)
    }

    // 4. Uploader l'image au storage
    const originalUrl = await this.imageStorage.uploadImage(
      validatedInput.projectId,
      validatedInput.file
    )

    // 5. Créer l'entrée en base
    const image = await this.imagesRepository.createImage({
      projectId: validatedInput.projectId,
      userId,
      originalUrl,
      transformationType: validatedInput.transformationType,
      status: 'pending',
      customPrompt: validatedInput.customPrompt,
      withFurniture: validatedInput.withFurniture,
      roomType: validatedInput.roomType,
      customRoom: validatedInput.customRoom,
      roomWidth: validatedInput.roomWidth,   // 📏 Dimensions de la pièce
      roomLength: validatedInput.roomLength, // 📏 Dimensions de la pièce
      roomArea: validatedInput.roomArea,     // 📏 Dimensions de la pièce
      strength: validatedInput.strength,     // 🎚️ Intensité de la transformation IA
    })

    return image
  }

  /**
   * Mettre à jour une image
   */
  async updateImage(imageId: string, input: UpdateImageInput): Promise<Image> {
    // 1. Valider l'input
    const validatedInput = updateImageInputSchema.parse(input)

    // 2. Mettre à jour
    return this.imagesRepository.updateImage(imageId, validatedInput)
  }

  /**
   * Supprimer une image
   */
  async deleteImage(imageId: string): Promise<void> {
    // 1. Récupérer l'image
    const image = await this.imagesRepository.getImageById(imageId)

    if (!image) {
      throw new Error('Image not found')
    }

    // 2. Supprimer les fichiers du storage
    try {
      await this.imageStorage.deleteImage(image.originalUrl)

      if (image.transformedUrl) {
        await this.imageStorage.deleteImage(image.transformedUrl)
      }
    } catch (error) {
      logger.error('Failed to delete image files:', error)
      // Continue quand même
    }

    // 3. Supprimer l'entrée en base
    return this.imagesRepository.deleteImage(imageId)
  }
}
