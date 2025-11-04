/**
 * Module Auth - Types & Schemas
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  company?: string
  role?: 'user' | 'admin'
  emailVerified: boolean
  creditsBalance: number
  subscriptionPlanId?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  displayName?: string // For public showcase
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

export interface AuthResult {
  success: boolean
  message?: string
  error?: string
  user?: User
}

// ============================================
// INTERFACES (Ports)
// ============================================

export interface IAuthProvider {
  signUp(data: SignUpInput): Promise<User>
  signIn(data: SignInInput): Promise<Session>
  signOut(): Promise<void>
  signInWithGoogle(): Promise<Session>
  getCurrentUser(): Promise<User | null>
  updateUser(userId: string, data: UpdateUserInput): Promise<User>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
}

export interface IUsersRepository {
  getById(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  update(id: string, data: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  company: z.string().max(200).optional(),
  role: z.enum(['user', 'admin']).optional(),
  emailVerified: z.boolean(),
  creditsBalance: z.number().int().nonnegative(),
  subscriptionPlanId: z.string().uuid().optional(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  displayName: z.string().max(100).optional(),
})

export const signUpInputSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z.string().min(1, 'Le prénom est requis').max(100),
  lastName: z.string().min(1, 'Le nom est requis').max(100),
  company: z.string().max(200).optional(),
})

export const signInInputSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const resetPasswordInputSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const updateUserInputSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  company: z.string().max(200).nullable().optional(),
})

// ============================================
// INFERRED TYPES
// ============================================

export type SignUpInput = z.infer<typeof signUpInputSchema>
export type SignInInput = z.infer<typeof signInInputSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>
