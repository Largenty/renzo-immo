/**
 * Modèle du domaine : Transformation Type
 * Représente un type de transformation en base de données
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

/**
 * Type de transformation depuis la base de données
 */
export interface TransformationType {
  id: string
  slug: string
  displayNameFr: string
  displayNameEn: string
  description?: string | null
  category: 'depersonalization' | 'staging' | 'renovation' | 'custom'
  iconName?: string | null
  basePromptTemplate?: string | null
  allowFurnitureToggle: boolean
  allowRoomTypeSelection: boolean
  creditCost: number
  isSystem: boolean
  isActive: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const transformationTypeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  displayNameFr: z.string().min(1),
  displayNameEn: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.enum(['depersonalization', 'staging', 'renovation', 'custom']),
  iconName: z.string().nullable().optional(),
  basePromptTemplate: z.string().nullable().optional(),
  allowFurnitureToggle: z.boolean(),
  allowRoomTypeSelection: z.boolean(),
  creditCost: z.number().int().min(0),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  orderIndex: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type TransformationTypeValidated = z.infer<typeof transformationTypeSchema>
