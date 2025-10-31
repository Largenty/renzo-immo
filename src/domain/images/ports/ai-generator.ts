/**
 * Port : AI Generator
 * Interface abstraite pour la génération d'images par IA
 */

import type { TransformImageResult } from '../models/image'

export interface GenerateImageInput {
  imageId: string
  originalUrl: string
  transformationType: string
  customPrompt?: string
  withFurniture?: boolean
  roomType?: string
}

export interface CheckStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transformedUrl?: string
  errorMessage?: string
}

export interface IAIGenerator {
  /**
   * Générer une image transformée
   */
  generateImage(input: GenerateImageInput): Promise<TransformImageResult>

  /**
   * Vérifier le statut d'une génération en cours
   */
  checkStatus(imageId: string, taskId: string): Promise<CheckStatusResult>
}
