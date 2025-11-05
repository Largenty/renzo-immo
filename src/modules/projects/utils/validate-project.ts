/**
 * Règles métier : Validation de projet
 */

/**
 * Vérifie si un nom de projet est valide
 */
export function isValidProjectName(name: string): boolean {
  return name.trim().length >= 1 && name.length <= 200
}

/**
 * Vérifie si un projet peut être supprimé
 * (ex: un projet avec des images en cours de traitement ne peut pas être supprimé)
 */
export function canDeleteProject(processingImages: number): boolean {
  return processingImages === 0
}

/**
 * Calcule le taux de complétion d'un projet
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Erreur métier : Impossible de supprimer un projet
 */
export class CannotDeleteProjectError extends Error {
  constructor(public readonly reason: string) {
    super(`Impossible de supprimer le projet : ${reason}`)
    this.name = 'CannotDeleteProjectError'
  }
}
