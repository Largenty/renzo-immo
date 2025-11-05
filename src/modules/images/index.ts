/**
 * Module Images - Exports
 * Génération et transformation d'images IA
 *
 * ARCHITECTURE:
 * - generation/     → Adaptateurs IA (NanoBanana, etc.) - INTERNE
 * - prompts/        → Templates de prompts et prompt engineering
 * - services/       → Use cases métier (generate, manage, transform)
 * - api/            → Repositories et storage adapters
 * - ui/             → Composants (upload, gallery, etc.)
 * - utils/          → Helpers et validateurs
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types'

// ============================================================================
// UI (Hooks & Components)
// ============================================================================
// Hooks
export {
  useProjectImages,
  useImage,
  useUploadImage,
  useUpdateImage,
  useDeleteImage,
  useGenerateImage,
  useRegenerateImage,
  useCheckGenerationStatus,
  usePollingGenerationStatus,
} from './ui/hooks/use-images'
export { useImagePolling } from './ui/hooks/use-image-polling'

// Components
export { ImageUploader } from './ui/components/ImageUploader'
export { SimpleImageUpload } from './ui/components/SimpleImageUpload'
export { RetryButton } from './ui/components/retry-button'
export { ImagePollingHandler } from './ui/components/image-polling-handler'

// ============================================================================
// SERVICES (Use Cases métier - API Routes & Client)
// ============================================================================
export { ManageImagesService } from './services/manage-images'
export { GenerateImageService } from './services/generate-image'

// ============================================================================
// API (Repositories & Storage)
// ============================================================================
export { SupabaseImagesRepository } from './api/images.repository'
export { SupabaseImageStorage } from './api/image-storage.adapter'

// ============================================================================
// GENERATION (AI Adapters - Server-side only pour nanobanana.adapter)
// ============================================================================
// Client-safe version (pas de sharp)
export { NanoBananaAIGeneratorClient } from './generation/nanobanana-client.adapter'

// NanoBananaAIGenerator (avec sharp) est server-only
// Pour l'utiliser dans API routes :
// import { NanoBananaAIGenerator } from '@/modules/images/generation/nanobanana.adapter'

// ============================================================================
// PROMPTS (Builders & Templates)
// ============================================================================
// buildPrompt est server-only (utilise createClient from server)
// Pour l'utiliser : import { buildPrompt } from '@/modules/images/prompts/prompt-builder'
export * from './prompts/prompt-templates'

// ============================================================================
// UTILS (Validateurs & Helpers)
// ============================================================================
// Image validation
export {
  SUPPORTED_IMAGE_FORMATS,
  MAX_IMAGE_SIZE,
  isSupportedImageFormat,
  isValidImageSize,
  getInvalidFormatMessage,
  getInvalidSizeMessage,
  InvalidImageFormatError,
  InvalidImageSizeError,
} from './utils/validate-image'

// Generation status helpers
export {
  canRegenerateImage,
  isImageProcessing,
  isImageCompleted,
  hasImageFailed,
  shouldContinuePolling,
  getPollingInterval,
  MAX_POLLING_ATTEMPTS,
  CannotRegenerateImageError,
} from './utils/check-generation-status'

export { sanitizePrompt } from './utils/prompt-sanitizer'
