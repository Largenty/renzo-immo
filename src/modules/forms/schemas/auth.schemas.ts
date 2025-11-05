import { z } from 'zod'

/**
 * Schema de validation de mot de passe sécurisé
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')

/**
 * Schema Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email('Email invalide'),

  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema Signup
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "L'email est requis")
      .email('Email invalide'),

    password: passwordSchema,

    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),

    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Vous devez accepter les conditions générales',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type SignupFormData = z.infer<typeof signupSchema>

/**
 * Schema Forgot Password
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email('Email invalide'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Schema Reset Password
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
