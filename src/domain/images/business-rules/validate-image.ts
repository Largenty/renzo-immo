/**
 * Règles métier : Validation d'image
 */

/**
 * Formats d'image supportés
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

/**
 * Taille maximale d'une image (10 MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Vérifie si un format d'image est supporté
 */
export function isSupportedImageFormat(mimeType: string): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(mimeType as any)
}

/**
 * Vérifie si la taille d'image est valide
 */
export function isValidImageSize(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= MAX_IMAGE_SIZE
}

/**
 * Obtient le message d'erreur pour un format invalide
 */
export function getInvalidFormatMessage(mimeType: string): string {
  return `Format ${mimeType} non supporté. Formats acceptés : JPG, PNG, WEBP`
}

/**
 * Obtient le message d'erreur pour une taille invalide
 */
export function getInvalidSizeMessage(sizeInBytes: number): string {
  const sizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
  const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024)
  return `Fichier trop volumineux (${sizeMB} MB). Taille maximale : ${maxSizeMB} MB`
}

/**
 * Erreur métier : Format d'image invalide
 */
export class InvalidImageFormatError extends Error {
  constructor(public readonly mimeType: string) {
    super(getInvalidFormatMessage(mimeType))
    this.name = 'InvalidImageFormatError'
  }
}

/**
 * Erreur métier : Taille d'image invalide
 */
export class InvalidImageSizeError extends Error {
  constructor(public readonly sizeInBytes: number) {
    super(getInvalidSizeMessage(sizeInBytes))
    this.name = 'InvalidImageSizeError'
  }
}
