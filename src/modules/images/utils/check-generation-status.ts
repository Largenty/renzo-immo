/**
 * Règles métier : Vérification du statut de génération
 */

import type { ImageStatus } from '../types'

/**
 * Vérifie si une image peut être régénérée
 */
export function canRegenerateImage(status: ImageStatus): boolean {
  // On peut régénérer si l'image est terminée ou a échoué
  return status === 'completed' || status === 'failed'
}

/**
 * Vérifie si une image est en cours de traitement
 */
export function isImageProcessing(status: ImageStatus): boolean {
  return status === 'processing'
}

/**
 * Vérifie si une image est terminée
 */
export function isImageCompleted(status: ImageStatus): boolean {
  return status === 'completed'
}

/**
 * Vérifie si une image a échoué
 */
export function hasImageFailed(status: ImageStatus): boolean {
  return status === 'failed'
}

/**
 * Détermine si le polling doit continuer
 */
export function shouldContinuePolling(status: ImageStatus, attempts: number, maxAttempts: number): boolean {
  // Continuer si processing ET pas encore max attempts
  return status === 'processing' && attempts < maxAttempts
}

/**
 * Calcule l'intervalle de polling (en ms)
 */
export function getPollingInterval(attempts: number): number {
  // Polling exponentiel : 5s, 10s, 15s, 20s, puis 30s
  if (attempts < 2) return 5000
  if (attempts < 4) return 10000
  if (attempts < 6) return 15000
  if (attempts < 10) return 20000
  return 30000 // Max 30s
}

/**
 * Nombre maximum de tentatives de polling (20 min avec intervalles variables)
 */
export const MAX_POLLING_ATTEMPTS = 60

/**
 * Erreur métier : Impossible de régénérer
 */
export class CannotRegenerateImageError extends Error {
  constructor(public readonly currentStatus: ImageStatus) {
    super(`Impossible de régénérer l'image avec le statut : ${currentStatus}`)
    this.name = 'CannotRegenerateImageError'
  }
}
