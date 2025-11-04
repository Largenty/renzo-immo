/**
 * Adapter : AI Generator NanoBanana
 * Implémentation concrète du port IAIGenerator avec l'API NanoBanana
 */

import type { IAIGenerator, GenerateImageInput } from '@/domain/images/ports/ai-generator'
import type { TransformImageResult } from '@/domain/images/models/image'
import { logger } from '@/lib/logger';

interface NanoBananaConfig {
  apiKey: string
  baseUrl?: string
}

interface NanoBananaGenerateResponse {
  data?: {
    taskId?: string
    imageUrl?: string
  }
  taskId?: string
  imageUrl?: string
  url?: string
  output?: string[]
}

interface NanoBananaStatusResponse {
  data?: {
    successFlag?: number // 0 = processing, 1 = completed, 2 = creation failed, 3 = generation failed
    response?: {
      originImageUrl?: string
      resultImageUrl?: string
    }
    originImageUrl?: string
    resultImageUrl?: string
    url?: string
    imageUrl?: string
  }
  successFlag?: number
  url?: string
  imageUrl?: string
}

export class NanoBananaAIGenerator implements IAIGenerator {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(config: NanoBananaConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.nanobananaapi.ai/api/v1/nanobanana'
  }

  async generateImage(input: GenerateImageInput): Promise<TransformImageResult> {
    try {
      // 1. Détecter les dimensions de l'image originale
      const { imageSize, originalWidth, originalHeight } = await this.detectImageDimensions(
        input.originalUrl
      )

      logger.debug(
        `📐 Original image dimensions: ${originalWidth}x${originalHeight} (NanoBanana ratio: ${imageSize})`
      )

      // 2. Récupérer le prompt approprié
      const prompt = await this.getPrompt(input)

      logger.debug('🎨 Generating image with prompt:', prompt.substring(0, 100) + '...')

      // 3. Appeler l'API NanoBanana
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          numImages: 1,
          type: 'IMAGETOIAMGE', // Note: typo in their API
          image_size: imageSize,
          imageUrls: [input.originalUrl],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('❌ NanoBanana API error:', errorText)
        throw new Error(`NanoBanana API failed: ${response.status} - ${errorText}`)
      }

      const result: NanoBananaGenerateResponse = await response.json()
      logger.debug('📦 NanoBanana result:', JSON.stringify(result, null, 2))

      // 4. Extraire le taskId ou l'URL de l'image
      const taskId = result.data?.taskId || result.taskId
      const imageUrl =
        result.data?.imageUrl || result.imageUrl || result.url || result.output?.[0]

      if (!taskId && !imageUrl) {
        throw new Error('No task ID or image URL in NanoBanana response')
      }

      // Si on a directement une image, on la retourne
      if (imageUrl) {
        logger.debug('✅ Image generated directly:', imageUrl)
        return {
          imageId: input.imageId,
          status: 'completed',
          transformedUrl: imageUrl,
          taskId: taskId,
        }
      }

      // Sinon, on retourne le taskId pour polling
      logger.debug('⏳ Task queued with ID:', taskId)
      return {
        imageId: input.imageId,
        status: 'processing',
        taskId: taskId!,
      }
    } catch (error) {
      logger.error('Generate image error:', error)
      throw error
    }
  }

  async checkStatus(
    imageId: string,
    taskId: string
  ): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    transformedUrl?: string
    errorMessage?: string
  }> {
    try {
      logger.debug('🔍 Checking NanoBanana task status:', taskId)

      // Appeler l'API de status
      const response = await fetch(`${this.baseUrl}/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('❌ NanoBanana status check error:', errorText)
        throw new Error(`Failed to check task status: ${response.status}`)
      }

      const statusResult: NanoBananaStatusResponse = await response.json()
      logger.debug('📦 Task status:', JSON.stringify(statusResult, null, 2))

      // Vérifier le successFlag
      const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag

      // Chercher l'URL dans tous les endroits possibles
      const possibleUrls = [
        statusResult.data?.response?.resultImageUrl,
        statusResult.data?.response?.originImageUrl,
        statusResult.data?.originImageUrl,
        statusResult.data?.resultImageUrl,
        statusResult.data?.url,
        statusResult.data?.imageUrl,
        statusResult.url,
        statusResult.imageUrl,
      ].filter(Boolean) as string[]

      logger.debug('🎯 successFlag:', successFlag)
      logger.debug('🖼️ Possible URLs found:', possibleUrls)

      // successFlag: 0 = processing, 1 = completed, 2 = creation failed, 3 = generation failed
      switch (successFlag) {
        case 0:
          return {
            status: 'processing',
          }

        case 1: {
          const imageUrl = possibleUrls[0]
          if (!imageUrl) {
            throw new Error('Image completed but no URL found')
          }
          logger.debug('✅ Image ready:', imageUrl)
          return {
            status: 'completed',
            transformedUrl: imageUrl,
          }
        }

        case 2:
          return {
            status: 'failed',
            errorMessage: 'Task creation failed',
          }

        case 3:
          return {
            status: 'failed',
            errorMessage: 'Image generation failed',
          }

        default:
          return {
            status: 'processing',
          }
      }
    } catch (error) {
      logger.error('Check status error:', error)
      throw error
    }
  }

  /**
   * Détecter les dimensions de l'image et calculer le ratio NanoBanana le plus proche
   */
  private async detectImageDimensions(imageUrl: string): Promise<{
    imageSize: string
    originalWidth: number
    originalHeight: number
  }> {
    try {
      // Télécharger l'image
      const imageBuffer = await fetch(imageUrl).then((r) => r.arrayBuffer())

      // Import dynamique de sharp (ne sera exécuté que côté serveur)
      const sharp = (await import('sharp')).default
      const metadata = await sharp(Buffer.from(imageBuffer)).metadata()

      const originalWidth = metadata.width
      const originalHeight = metadata.height

      if (!originalWidth || !originalHeight) {
        throw new Error('Could not get image dimensions')
      }

      // Calculer le ratio et trouver le plus proche parmi ceux supportés
      const ratio = originalWidth / originalHeight
      const supportedRatios: Record<string, number> = {
        '1:1': 1,
        '16:9': 16 / 9,
        '9:16': 9 / 16,
        '4:3': 4 / 3,
        '3:4': 3 / 4,
        '3:2': 3 / 2,
        '2:3': 2 / 3,
        '5:4': 5 / 4,
        '4:5': 4 / 5,
        '21:9': 21 / 9,
      }

      // Trouver le ratio le plus proche
      let closestRatio = '16:9'
      let minDiff = Infinity

      for (const [ratioStr, ratioValue] of Object.entries(supportedRatios)) {
        const diff = Math.abs(ratio - ratioValue)
        if (diff < minDiff) {
          minDiff = diff
          closestRatio = ratioStr
        }
      }

      return {
        imageSize: closestRatio,
        originalWidth,
        originalHeight,
      }
    } catch (error) {
      logger.warn('⚠️ Could not detect image dimensions, using default 16:9:', error)
      return {
        imageSize: '16:9',
        originalWidth: 1920,
        originalHeight: 1080,
      }
    }
  }

  /**
   * Récupérer le prompt approprié
   * Pour l'instant, utilise le customPrompt s'il est fourni
   * TODO: Intégrer avec la table transformation_prompts si nécessaire
   */
  private async getPrompt(input: GenerateImageInput): Promise<string> {
    // Si un prompt personnalisé est fourni, l'utiliser
    if (input.customPrompt) {
      return input.customPrompt
    }

    // Sinon, créer un prompt basique basé sur le type de transformation
    // NOTE: Dans l'application réelle, vous voudrez probablement
    // interroger la table transformation_prompts via Supabase
    const furnitureMode = input.withFurniture === true ? 'with' : input.withFurniture === false ? 'without' : 'auto'

    return `Transform this image with ${input.transformationType} style. Room type: ${input.roomType || 'auto'}. Furniture mode: ${furnitureMode}.`
  }
}
