/**
 * Client-side stub for AI Generator
 * Makes API calls to server routes instead of calling NanoBanana directly
 */

'use client'

import type { IAIGenerator } from '@/domain/images/ports/ai-generator'

/**
 * Client-side adapter that delegates to API routes
 * This avoids importing server-only dependencies (like sharp) in client code
 */
export class NanoBananaAIGeneratorClient implements IAIGenerator {
  async generateImage(input: any): Promise<any> {
    // This should never be called directly from the client
    // Image generation must go through API routes
    throw new Error(
      'Direct AI generation from client is not allowed. Use API routes instead.'
    )
  }

  async checkStatus(
    imageId: string,
    taskId: string
  ): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    transformedUrl?: string
    errorMessage?: string
  }> {
    // This should also go through API routes
    throw new Error(
      'Direct status checking from client is not allowed. Use API routes instead.'
    )
  }
}
