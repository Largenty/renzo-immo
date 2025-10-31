/**
 * Domain: Rooms
 * Point d'entrée du domaine Rooms
 */

// Models
export * from './models/room'

// Business Rules
export * from './business-rules/validate-room'

// Ports (Interfaces)
export type { IRoomsRepository } from './ports/rooms-repository'

// Services
export { ManageRoomsService } from './services/manage-rooms'

// Hooks (React Query)
export * from './hooks/use-rooms'
