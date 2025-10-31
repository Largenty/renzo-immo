/**
 * Validateur de mot de passe sécurisé
 * Applique des règles de complexité strictes pour protéger les comptes utilisateurs
 */

import { z } from 'zod'

/**
 * Règles de sécurité des mots de passe:
 * - Minimum 12 caractères (recommandation OWASP/NIST 2024)
 * - Au moins une minuscule
 * - Au moins une majuscule
 * - Au moins un chiffre
 * - Au moins un caractère spécial
 *
 * Ces règles protègent contre:
 * - Attaques par dictionnaire
 * - Attaques par brute force
 * - Mots de passe courants/faibles
 */
export const passwordSchema = z
  .string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(
    /[^a-zA-Z0-9]/,
    'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)'
  )

/**
 * Liste de mots de passe couramment utilisés à bloquer
 * Source: Top 100 most common passwords
 */
const COMMON_PASSWORDS = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  'superman',
  'qazwsx',
  '123456789',
  'password1',
]

/**
 * Valide un mot de passe contre toutes les règles de sécurité
 *
 * @param password - Le mot de passe à valider
 * @returns Objet avec status de validation et liste d'erreurs
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validation Zod (longueur + complexité)
  try {
    passwordSchema.parse(password)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message))
    }
  }

  // Vérifier contre les mots de passe courants (case-insensitive)
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.includes(lowerPassword)) {
    errors.push('Ce mot de passe est trop courant et facilement devinable')
  }

  // Vérifier si le mot de passe contient des séquences répétées
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir de caractères répétés (ex: aaa, 111)')
  }

  // Vérifier si le mot de passe contient des séquences simples
  const sequences = ['abc', '123', 'qwe', 'xyz']
  if (sequences.some((seq) => lowerPassword.includes(seq))) {
    errors.push('Le mot de passe ne doit pas contenir de séquences simples (abc, 123, qwe...)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Évalue la force d'un mot de passe (0-100)
 * Utilisé pour afficher un indicateur visuel à l'utilisateur
 *
 * @param password - Le mot de passe à évaluer
 * @returns Score de 0 à 100
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0

  // Longueur (max 30 points)
  if (password.length >= 12) score += 15
  if (password.length >= 16) score += 10
  if (password.length >= 20) score += 5

  // Minuscules (10 points)
  if (/[a-z]/.test(password)) score += 10

  // Majuscules (10 points)
  if (/[A-Z]/.test(password)) score += 10

  // Chiffres (10 points)
  if (/[0-9]/.test(password)) score += 10

  // Caractères spéciaux (15 points)
  const specialChars = password.match(/[^a-zA-Z0-9]/g)
  if (specialChars) {
    score += Math.min(specialChars.length * 5, 15)
  }

  // Diversité (15 points)
  const uniqueChars = new Set(password).size
  if (uniqueChars > password.length * 0.5) score += 10
  if (uniqueChars > password.length * 0.7) score += 5

  // Pénalités
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) score -= 50
  if (/(.)\1{2,}/.test(password)) score -= 20

  return Math.max(0, Math.min(100, score))
}

/**
 * Retourne un message descriptif basé sur le score de force
 */
export function getPasswordStrengthLabel(score: number): {
  label: string
  color: 'red' | 'orange' | 'yellow' | 'green'
} {
  if (score < 40) return { label: 'Très faible', color: 'red' }
  if (score < 60) return { label: 'Faible', color: 'orange' }
  if (score < 80) return { label: 'Moyen', color: 'yellow' }
  return { label: 'Fort', color: 'green' }
}

/**
 * Type pour le résultat de validation
 */
export type PasswordValidationResult = ReturnType<typeof validatePassword>
export type PasswordStrengthScore = ReturnType<typeof calculatePasswordStrength>
export type PasswordStrengthLabel = ReturnType<typeof getPasswordStrengthLabel>
