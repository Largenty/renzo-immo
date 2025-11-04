/**
 * Domaine Images - Point d'entrée
 */

// Models
export * from './models/image'

// Business Rules
export * from './business-rules/validate-image'

// Ports
export type { IImagesRepository } from './ports/images-repository'
export type { IImageStorage } from './ports/image-storage'
export type { IAIGenerator } from './ports/ai-generator'

// Services
export { ManageImagesService } from './services/manage-images'
export { GenerateImageService } from './services/generate-image'

// Hooks (React) - Re-export from application layer
export {
  useProjectImages,
  useDeleteImage,
  useUploadImage,
  useGenerateImage,
  useRegenerateImage,
  useCheckGenerationStatus,
  usePollingGenerationStatus, // Fixed: was useImagePolling
} from '@/application/images/use-images'
