/**
 * Modèle du domaine : Transformation Style
 * Représente un style de transformation (système ou personnalisé)
 */

import { z } from 'zod'
import type { LucideIcon } from 'lucide-react'

// ============================================
// TYPES
// ============================================

/**
 * Types de transformation système (built-in)
 */
export type SystemTransformationType =
  | 'depersonnalisation'
  | 'depersonnalisation_premium'
  | 'home_staging_moderne'
  | 'home_staging_scandinave'
  | 'home_staging_industriel'
  | 'renovation_luxe'
  | 'renovation_contemporaine'
  | 'style_personnalise'

/**
 * Type de transformation (système ou custom avec prefix "custom_")
 */
export type TransformationType = SystemTransformationType | `custom_${string}`

/**
 * Custom Style (Transformation Type personnalisé par l'utilisateur)
 */
export interface CustomStyle {
  id: string
  userId: string
  slug: string
  name: string
  description?: string | null
  iconName?: string | null
  category?: string | null
  promptTemplate?: string | null
  exampleImageUrl?: string | null
  allowFurnitureToggle: boolean
  isSystem: boolean
  isActive: boolean
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Transformation Option pour l'UI (système ou custom)
 */
export interface TransformationOption {
  id?: string // ✅ AJOUTÉ: UUID du transformation_type en DB
  value: TransformationType
  label: string
  description: string
  icon: LucideIcon
  allowFurnitureToggle?: boolean
  isCustom?: boolean
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const systemTransformationTypeSchema = z.enum([
  'depersonnalisation',
  'depersonnalisation_premium',
  'home_staging_moderne',
  'home_staging_scandinave',
  'home_staging_industriel',
  'renovation_luxe',
  'renovation_contemporaine',
  'style_personnalise',
])

export const transformationTypeSchema = z.union([
  systemTransformationTypeSchema,
  z.string().startsWith('custom_'),
])

export const customStyleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  iconName: z.string().max(50).nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  promptTemplate: z.string().max(5000).nullable().optional(),
  exampleImageUrl: z.string().url().nullable().optional(),
  allowFurnitureToggle: z.boolean(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ============================================
// SCHÉMAS D'ENTRÉE
// ============================================

export const createCustomStyleInputSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500).optional(),
  iconName: z.string().max(50).optional(),
  promptTemplate: z.string().max(5000).optional(),
  allowFurnitureToggle: z.boolean().default(false),
})

export const updateCustomStyleInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  iconName: z.string().max(50).nullable().optional(),
  promptTemplate: z.string().max(5000).nullable().optional(),
  allowFurnitureToggle: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateCustomStyleInput = z.infer<typeof createCustomStyleInputSchema>
export type UpdateCustomStyleInput = z.infer<typeof updateCustomStyleInputSchema>
