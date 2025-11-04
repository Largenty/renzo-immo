/**
 * Modèle du domaine : Room Specification
 * Représente les spécifications d'un type de pièce
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

/**
 * Types de pièces disponibles
 */
export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'office'
  | 'hallway'
  | 'terrace'
  | 'garage'
  | 'basement'
  | 'attic'
  | 'laundry'
  | 'dressing'
  | 'kids_room'
  | 'playroom'

/**
 * Zone fonctionnelle d'une pièce
 */
export interface FunctionalZone {
  name: string
  description: string
  minArea?: number
  typical?: boolean
}

/**
 * Spécification complète d'un type de pièce
 */
export interface RoomSpecification {
  id: string
  roomType: RoomType
  displayNameFr: string
  displayNameEn: string
  constraintsText: string
  typicalAreaMin?: number | null
  typicalAreaMax?: number | null
  zones?: FunctionalZone[] | null
  description?: string | null
  iconName?: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const roomTypeSchema = z.enum([
  'living_room',
  'bedroom',
  'kitchen',
  'bathroom',
  'dining_room',
  'office',
  'hallway',
  'terrace',
  'garage',
  'basement',
  'attic',
  'laundry',
  'dressing',
  'kids_room',
  'playroom',
])

export const functionalZoneSchema = z.object({
  name: z.string(),
  description: z.string(),
  minArea: z.number().optional(),
  typical: z.boolean().optional(),
})

export const roomSpecificationSchema = z.object({
  id: z.string().uuid(),
  roomType: roomTypeSchema,
  displayNameFr: z.string().min(1),
  displayNameEn: z.string().min(1),
  constraintsText: z.string(),
  typicalAreaMin: z.number().nullable().optional(),
  typicalAreaMax: z.number().nullable().optional(),
  zones: z.array(functionalZoneSchema).nullable().optional(),
  description: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type RoomSpecificationValidated = z.infer<typeof roomSpecificationSchema>
