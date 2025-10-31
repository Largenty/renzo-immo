/**
 * Client-side adapter for NanoBanana AI Generator
 * Calls server-side API routes for actual AI operations
 */

import type { IAIGenerator, GenerateImageInput, CheckStatusResult } from '@/domain/images/ports/ai-generator'
import type { TransformImageResult } from '@/domain/images/models/image'

export class NanoBananaAIGeneratorClient implements IAIGenerator {
  async generateImage(input: GenerateImageInput): Promise<TransformImageResult> {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId: input.imageId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate image')
    }

    const result = await response.json()

    return {
      imageId: result.imageId,
      status: result.status || 'processing',
      transformedUrl: result.transformedUrl,
      taskId: result.taskId,
    }
  }

  async checkStatus(imageId: string, taskId: string): Promise<CheckStatusResult> {
    const response = await fetch('/api/check-generation-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
        taskId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check status')
    }

    const result = await response.json()

    return {
      status: result.status,
      transformedUrl: result.transformedUrl,
      errorMessage: result.message,
    }
  }
}
