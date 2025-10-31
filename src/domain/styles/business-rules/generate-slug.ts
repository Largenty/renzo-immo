/**
 * Règle métier : Génération de slug pour les styles personnalisés
 */

/**
 * Génère un slug unique à partir d'un nom
 * @param name - Nom du style
 * @returns Slug normalisé et unique
 */
export function generateStyleSlug(name: string): string {
  // Normaliser le nom
  const normalized = name
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '_') // Remplacer non-alphanumériques par underscore
    .replace(/^_+|_+$/g, '') // Supprimer underscores en début/fin
    .substring(0, 50) // Limiter la longueur

  // Ajouter timestamp pour unicité
  return `custom_${normalized}_${Date.now()}`
}

/**
 * Vérifie si un slug est valide
 */
export function isValidStyleSlug(slug: string): boolean {
  // Le slug doit commencer par "custom_" pour les styles utilisateur
  if (!slug.startsWith('custom_')) return false

  // Le slug ne doit contenir que des lettres, chiffres et underscores
  const pattern = /^custom_[a-z0-9_]+$/
  return pattern.test(slug)
}
