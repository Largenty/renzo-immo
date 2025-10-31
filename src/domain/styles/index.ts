/**
 * Domaine Styles - Point d'entrée
 * Export tous les éléments publics du domaine
 */

// Models
export * from './models/transformation-style'

// Business Rules
export * from './business-rules/generate-slug'

// Ports
export type { IStylesRepository } from './ports/styles-repository'

// Services
export { ManageCustomStylesService } from './services/manage-custom-styles'
export { GetTransformationTypesService, defaultTransformationTypes } from './services/get-transformation-types'

// Hooks (React)
export {
  useCustomStyles,
  useCustomStyle,
  useAllTransformationTypes,
  useCreateCustomStyle,
  useUpdateCustomStyle,
  useDeleteCustomStyle,
} from './hooks/use-styles'
