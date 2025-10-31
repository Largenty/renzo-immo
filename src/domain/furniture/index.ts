/**
 * Domain: Furniture
 * Point d'entrée du domaine Furniture
 */

// Models
export * from './models/furniture'

// Business Rules
export * from './business-rules/validate-furniture'

// Ports (Interfaces)
export type { IFurnitureRepository } from './ports/furniture-repository'

// Services
export { ManageFurnitureService } from './services/manage-furniture'

// Hooks (React Query)
export * from './hooks/use-furniture'
