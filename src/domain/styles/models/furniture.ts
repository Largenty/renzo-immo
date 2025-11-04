/**
 * Modèle du domaine : Furniture (Mobilier)
 * Représente les éléments de mobilier et leur catalogue
 */

import { z } from 'zod'
import type { RoomType } from './room-specification'

// ============================================
// TYPES
// ============================================

/**
 * Catégories de mobilier
 */
export type FurnitureCategory =
  | 'seating'        // Assises
  | 'table'          // Tables
  | 'storage'        // Rangement
  | 'bed'            // Lit
  | 'lighting'       // Éclairage
  | 'decoration'     // Décoration
  | 'appliance'      // Électroménager
  | 'bathroom'       // Salle de bain
  | 'outdoor'        // Extérieur
  | 'office'         // Bureau
  | 'textile'        // Textile

/**
 * Dimensions typiques d'un meuble (en cm)
 */
export interface FurnitureDimensions {
  width?: number
  depth?: number
  height?: number
}

/**
 * Élément du catalogue de mobilier
 */
export interface FurnitureCatalogItem {
  id: string
  category: FurnitureCategory
  roomTypes: RoomType[]
  nameFr: string
  nameEn: string
  genericDescription?: string | null
  typicalDimensions?: FurnitureDimensions | null
  isEssential: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Variante de mobilier pour un style spécifique
 */
export interface StyleFurnitureVariant {
  id: string
  transformationTypeId: string
  furnitureId: string
  stylizedDescriptionFr: string
  stylizedDescriptionEn: string
  promptModifier?: string | null
  isRecommended: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const furnitureCategorySchema = z.enum([
  'seating',
  'table',
  'storage',
  'bed',
  'lighting',
  'decoration',
  'appliance',
  'bathroom',
  'outdoor',
  'office',
  'textile',
])

export const furnitureDimensionsSchema = z.object({
  width: z.number().optional(),
  depth: z.number().optional(),
  height: z.number().optional(),
})

export const furnitureCatalogItemSchema = z.object({
  id: z.string().uuid(),
  category: furnitureCategorySchema,
  roomTypes: z.array(z.string()),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  genericDescription: z.string().nullable().optional(),
  typicalDimensions: furnitureDimensionsSchema.nullable().optional(),
  isEssential: z.boolean(),
  priority: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const styleFurnitureVariantSchema = z.object({
  id: z.string().uuid(),
  transformationTypeId: z.string().uuid(),
  furnitureId: z.string().uuid(),
  stylizedDescriptionFr: z.string().min(1),
  stylizedDescriptionEn: z.string().min(1),
  promptModifier: z.string().nullable().optional(),
  isRecommended: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type FurnitureCatalogItemValidated = z.infer<typeof furnitureCatalogItemSchema>
export type StyleFurnitureVariantValidated = z.infer<typeof styleFurnitureVariantSchema>
