import { z } from 'zod'

/**
 * Schema pour la création/édition d'une pièce
 */
export const roomSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de la pièce est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  roomType: z
    .string()
    .min(1, 'Le type de pièce est requis'),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),

  originalImage: z
    .any()
    .refine(
      (file) => {
        // Skip validation if no file or not in browser context
        if (!file || typeof File === 'undefined') return true
        return file instanceof File
      },
      'Doit être un fichier valide'
    )
    .refine(
      (file) => {
        if (!file || typeof File === 'undefined') return true
        return file.size <= 10 * 1024 * 1024
      },
      "La taille de l'image ne peut pas dépasser 10MB"
    )
    .refine(
      (file) => {
        if (!file || typeof File === 'undefined') return true
        return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      },
      'Format accepté : JPEG, PNG, WebP'
    )
    .optional()
    .nullable(),
})

export type RoomFormData = z.infer<typeof roomSchema>

/**
 * Schema pour la création/édition d'un type de pièce
 */
export const roomTypeSchema = z
  .object({
    slug: z
      .string()
      .min(1, 'Le slug est requis')
      .regex(
        /^[a-z0-9-]+$/,
        'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
      )
      .max(50, 'Le slug ne peut pas dépasser 50 caractères'),

    displayNameFr: z
      .string()
      .min(1, 'Le nom français est requis')
      .min(2, 'Le nom français doit contenir au moins 2 caractères')
      .max(100, 'Le nom français ne peut pas dépasser 100 caractères'),

    displayNameEn: z
      .string()
      .min(1, 'Le nom anglais est requis')
      .min(2, 'Le nom anglais doit contenir au moins 2 caractères')
      .max(100, 'Le nom anglais ne peut pas dépasser 100 caractères'),

    roomCategory: z.enum(['living', 'sleeping', 'wet', 'service', 'outdoor'], {
      message: 'Catégorie invalide',
    }),

    areaMin: z
      .number()
      .min(1, 'La surface minimale doit être supérieure à 0')
      .max(1000, 'La surface minimale ne peut pas dépasser 1000 m²')
      .optional()
      .nullable(),

    areaMax: z
      .number()
      .min(1, 'La surface maximale doit être supérieure à 0')
      .max(1000, 'La surface maximale ne peut pas dépasser 1000 m²')
      .optional()
      .nullable(),

    heightMin: z
      .number()
      .min(1.5, 'La hauteur minimale doit être au moins 1.5m')
      .max(10, 'La hauteur minimale ne peut pas dépasser 10m')
      .optional()
      .nullable(),

    heightMax: z
      .number()
      .min(1.5, 'La hauteur maximale doit être au moins 1.5m')
      .max(10, 'La hauteur maximale ne peut pas dépasser 10m')
      .optional()
      .nullable(),

    description: z
      .string()
      .max(500, 'La description ne peut pas dépasser 500 caractères')
      .optional()
      .or(z.literal('')),

    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.areaMin && data.areaMax) {
        return data.areaMin < data.areaMax
      }
      return true
    },
    {
      message: 'La surface minimale doit être inférieure à la surface maximale',
      path: ['areaMax'],
    }
  )
  .refine(
    (data) => {
      if (data.heightMin && data.heightMax) {
        return data.heightMin < data.heightMax
      }
      return true
    },
    {
      message: 'La hauteur minimale doit être inférieure à la hauteur maximale',
      path: ['heightMax'],
    }
  )

export type RoomTypeFormData = z.infer<typeof roomTypeSchema>
