/**
 * Modèle du domaine : Project
 * Représente un projet immobilier
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

export interface Project {
  id: string
  userId: string
  name: string
  address?: string
  description?: string
  coverImageUrl?: string
  totalImages: number
  completedImages: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectStats {
  totalImages: number
  completedImages: number
  pendingImages: number
  processingImages: number
  failedImages: number
}

export interface ProjectWithStats extends Project {
  stats: ProjectStats
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const projectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  coverImageUrl: z.string().url().optional(),
  totalImages: z.number().int().nonnegative(),
  completedImages: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const projectStatsSchema = z.object({
  totalImages: z.number().int().nonnegative(),
  completedImages: z.number().int().nonnegative(),
  pendingImages: z.number().int().nonnegative(),
  processingImages: z.number().int().nonnegative(),
  failedImages: z.number().int().nonnegative(),
})

// ============================================
// SCHÉMAS D'ENTRÉE
// ============================================

export const createProjectInputSchema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis').max(200, 'Le nom est trop long'),
  address: z.string().max(500, 'L\'adresse est trop longue').optional(),
  description: z.string().max(2000, 'La description est trop longue').optional(),
  coverImage: typeof File !== 'undefined' ? z.instanceof(File).optional() : z.any().optional(),
})

export const updateProjectInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
})

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>
