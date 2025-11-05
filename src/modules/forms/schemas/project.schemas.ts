import { z } from 'zod'

/**
 * Schema pour la création d'un projet
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du projet est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  address: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),

  coverImage: z
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
        return file.size <= 5 * 1024 * 1024
      },
      "La taille de l'image ne peut pas dépasser 5MB"
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

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

/**
 * Schema pour l'édition d'un projet
 */
export const editProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom du projet est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

  address: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),

  coverImage: z
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
        return file.size <= 5 * 1024 * 1024
      },
      "La taille de l'image ne peut pas dépasser 5MB"
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

  coverImageUrl: z.string().url().optional().nullable(),
})

export type EditProjectFormData = z.infer<typeof editProjectSchema>
