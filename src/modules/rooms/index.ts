/**
 * Module Rooms - Exports
 * Types de pièces et leurs spécifications
 */

// Types
export * from './types'

// Hooks
export * from './ui/hooks/use-rooms'

// Components
export { RoomCard } from './ui/components/room-card'
export { RoomFormDialog } from './ui/components/room-form-dialog'

// Forms (React Hook Form + Zod)
export { RoomForm } from './ui/forms/RoomForm'
export { RoomSpecificationForm } from './ui/forms/RoomSpecificationForm'

// API
export { RoomsRepository } from './api/rooms.repository'
