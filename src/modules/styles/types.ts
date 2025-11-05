/**
 * Modèle du domaine : Custom Style
 * Représente un style personnalisé créé par l'utilisateur
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

/**
 * Custom Style (style personnalisé utilisateur)
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

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

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
export type CustomStyleValidated = z.infer<typeof customStyleSchema>
/**
 * Modèle du domaine : Furniture (Mobilier)
 * Représente les éléments de mobilier et leur catalogue
 */

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
/**
 * Modèle du domaine : Room Specification
 * Représente les spécifications d'un type de pièce
 */


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
/**
 * Modèle du domaine : Transformation Style
 * Représente un style de transformation (système ou personnalisé)
 */

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

export const transformationTypeSlugSchema = z.union([
  systemTransformationTypeSchema,
  z.string().startsWith('custom_'),
])

/**
 * Modèle du domaine : Transformation Type
 * Représente un type de transformation en base de données
 */


// ============================================
// TYPES
// ============================================

/**
 * Type de transformation depuis la base de données
 */
export interface TransformationTypeRecord {
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
/**
 * Port : Styles Repository
 * Interface abstraite pour accéder aux styles de transformation
 */

export interface IStylesRepository {
  /**
   * Récupérer tous les styles personnalisés d'un utilisateur
   */
  getCustomStyles(userId: string): Promise<CustomStyle[]>

  /**
   * Récupérer un style personnalisé par ID
   */
  getCustomStyleById(userId: string, styleId: string): Promise<CustomStyle | null>

  /**
   * Récupérer tous les types de transformation (système + custom)
   */
  getAllTransformationTypes(userId: string): Promise<CustomStyle[]>

  /**
   * Créer un nouveau style personnalisé
   */
  createCustomStyle(userId: string, input: CreateCustomStyleInput): Promise<CustomStyle>

  /**
   * Mettre à jour un style personnalisé
   */
  updateCustomStyle(
    userId: string,
    styleId: string,
    input: UpdateCustomStyleInput
  ): Promise<CustomStyle>

  /**
   * Supprimer un style personnalisé
   */
  deleteCustomStyle(userId: string, styleId: string): Promise<void>
}
