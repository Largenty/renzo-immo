/**
 * Domaine Styles - Point d'entrée
 */

// Models
export * from './models/transformation-type'
export * from './models/custom-style'
export * from './models/room-specification'
export * from './models/furniture'

// Ports
export type { IStylesRepository } from './ports/styles-repository'

// Services
export { GetTransformationTypesService } from './services/get-transformation-types'
export { ManageCustomStylesService } from './services/manage-custom-styles'

// Hooks (React) - Re-export from application layer
export {
  useAllTransformationTypes,
  // useRoomSpecifications, // TODO: implement if needed
  // useFurnitureCatalog, // TODO: implement if needed
  useCustomStyles,
  useCreateCustomStyle,
  useUpdateCustomStyle,
  useDeleteCustomStyle,
} from '@/application/styles/use-styles'
