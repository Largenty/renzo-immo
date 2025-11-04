/**
 * Sanitization des prompts personnalisés
 * Protège contre les injections et les abus via les prompts IA
 */

import { z } from 'zod'

/**
 * Longueur maximale d'un prompt personnalisé
 * NanoBanana a des limites, et des prompts trop longs sont suspects
 */
const MAX_PROMPT_LENGTH = 1000

/**
 * Liste de patterns suspects à détecter/bloquer
 * Ces patterns peuvent indiquer des tentatives d'injection ou d'abus
 */
const SUSPICIOUS_PATTERNS = [
  /<script/gi, // Tags script HTML
  /javascript:/gi, // URLs javascript:
  /on\w+=/gi, // Event handlers (onclick=, onerror=, etc.)
  /data:text\/html/gi, // Data URLs HTML
  /vbscript:/gi, // VBScript (old IE)
  /<?php/gi, // PHP tags
  /<%/gi, // ASP/JSP tags
  /\beval\(/gi, // Fonction eval
  /\bexec\(/gi, // Fonction exec
  /\bsystem\(/gi, // Appels système
] as const

/**
 * Patterns de spam/abus
 */
const SPAM_PATTERNS = [
  /viagra/gi,
  /cialis/gi,
  /casino/gi,
  /poker/gi,
  /lottery/gi,
  /prize/gi,
] as const

/**
 * Sanitize un prompt personnalisé utilisateur
 * Applique plusieurs niveaux de nettoyage
 *
 * @param prompt - Le prompt à nettoyer
 * @returns Prompt sanitizé ou null si invalide
 */
export function sanitizePrompt(prompt: string | null | undefined): string | null {
  // 1. Si pas de prompt, retourner null
  if (!prompt || typeof prompt !== 'string') {
    return null
  }

  // 2. Trim des espaces
  let sanitized = prompt.trim()

  // 3. Si vide après trim, retourner null
  if (!sanitized) {
    return null
  }

  // 4. Limiter la longueur
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH)
  }

  // 5. Supprimer les caractères de contrôle (sauf newlines)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')

  // 6. Supprimer les tags HTML/XML
  sanitized = sanitized.replace(/<[^>]*>/g, '')

  // 7. Supprimer les URLs potentiellement dangereuses
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  sanitized = sanitized.replace(/vbscript:/gi, '')

  // 8. Supprimer les event handlers
  sanitized = sanitized.replace(/on\w+=/gi, '')

  // 9. Normaliser les espaces multiples
  sanitized = sanitized.replace(/\s+/g, ' ')

  // 10. Trim final
  sanitized = sanitized.trim()

  return sanitized || null
}

/**
 * Valide un prompt avec Zod après sanitization
 */
export const customPromptSchema = z
  .string()
  .max(MAX_PROMPT_LENGTH, `Le prompt ne peut pas dépasser ${MAX_PROMPT_LENGTH} caractères`)
  .refine(
    (val) => {
      // Vérifier les patterns suspects
      for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(val)) {
          return false
        }
      }
      return true
    },
    {
      message: 'Le prompt contient des caractères ou patterns non autorisés',
    }
  )
  .refine(
    (val) => {
      // Vérifier les patterns de spam
      for (const pattern of SPAM_PATTERNS) {
        if (pattern.test(val)) {
          return false
        }
      }
      return true
    },
    {
      message: 'Le prompt contient du contenu non autorisé',
    }
  )
  .nullable()

/**
 * Sanitize ET valide un prompt en une seule opération
 * Retourne soit le prompt sanitizé valide, soit null, soit une erreur
 */
export function sanitizeAndValidatePrompt(
  prompt: string | null | undefined
): { success: true; prompt: string | null } | { success: false; error: string } {
  // 1. Sanitize
  const sanitized = sanitizePrompt(prompt)

  // 2. Si null (vide), c'est OK
  if (!sanitized) {
    return { success: true, prompt: null }
  }

  // 3. Valider avec Zod
  try {
    customPromptSchema.parse(sanitized)
    return { success: true, prompt: sanitized }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Prompt invalide',
      }
    }
    return {
      success: false,
      error: 'Erreur de validation du prompt',
    }
  }
}

/**
 * Vérifie si un prompt contient des patterns suspects
 * Utilisé pour le logging/monitoring
 */
export function containsSuspiciousPatterns(prompt: string): boolean {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(prompt)) {
      return true
    }
  }
  return false
}

/**
 * Vérifie si un prompt contient du spam
 */
export function containsSpam(prompt: string): boolean {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(prompt)) {
      return true
    }
  }
  return false
}

/**
 * Compte le nombre de caractères dans un prompt
 * Utile pour afficher un compteur à l'utilisateur
 */
export function getPromptLength(prompt: string | null | undefined): number {
  return prompt?.trim().length || 0
}

/**
 * Retourne le nombre de caractères restants
 */
export function getRemainingLength(prompt: string | null | undefined): number {
  const length = getPromptLength(prompt)
  return Math.max(0, MAX_PROMPT_LENGTH - length)
}

/**
 * Types exportés
 */
export type SanitizeResult = ReturnType<typeof sanitizeAndValidatePrompt>
