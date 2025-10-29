/**
 * Barrel export pour tous les React Query hooks
 */

// Projects hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useCreateProjectWithCover,
  useUpdateProject,
  useDeleteProject,
} from './use-projects'
export type { Project, CreateProjectData } from './use-projects'

// Images hooks
export {
  useProjectImages,
  useUploadImage,
  useRegenerateImage,
  useDeleteImage,
  useGenerateImage,
} from './use-images'
export type { Image } from './use-images'

// Credits hooks
export {
  useCreditTransactions,
  useCreditStats,
  useConsumeCredits,
  useAddCredits,
} from './use-credits'
export type { CreditTransaction, CreditStats } from './use-credits'

// Custom Styles hooks
export {
  useCustomStyles,
  useCustomStyle,
  useAllTransformationTypes,
  useCreateCustomStyle,
  useUpdateCustomStyle,
  useDeleteCustomStyle,
} from './use-custom-styles'
export type { CustomStyle, CreateCustomStyleData, UpdateCustomStyleData } from './use-custom-styles'
