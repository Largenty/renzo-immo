/**
 * Règle métier : Validation de mot de passe
 * Définit les critères de sécurité des mots de passe
 */

export interface PasswordStrength {
  score: number // 0-4 (faible à très fort)
  feedback: string[]
  isValid: boolean
}

/**
 * Valide la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Longueur
  if (password.length < 8) {
    feedback.push('Le mot de passe doit contenir au moins 8 caractères')
  } else {
    score++
    if (password.length >= 12) score++
  }

  // Majuscule
  if (!/[A-Z]/.test(password)) {
    feedback.push('Ajoutez au moins une majuscule')
  } else {
    score++
  }

  // Minuscule
  if (!/[a-z]/.test(password)) {
    feedback.push('Ajoutez au moins une minuscule')
  } else {
    score++
  }

  // Chiffre
  if (!/[0-9]/.test(password)) {
    feedback.push('Ajoutez au moins un chiffre')
  } else {
    score++
  }

  // Caractère spécial (bonus)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
    feedback.push('✓ Caractère spécial présent (bonus de sécurité)')
  }

  // Patterns faibles
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Évitez les caractères répétés')
    score = Math.max(0, score - 1)
  }

  if (/123|abc|password|qwerty/i.test(password)) {
    feedback.push('Évitez les mots de passe courants')
    score = Math.max(0, score - 1)
  }

  const isValid = score >= 3 && password.length >= 8

  return {
    score: Math.min(4, score),
    feedback,
    isValid,
  }
}

/**
 * Obtient le label de force du mot de passe
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Très faible'
    case 2:
      return 'Faible'
    case 3:
      return 'Moyen'
    case 4:
      return 'Fort'
    default:
      return 'Inconnu'
  }
}

/**
 * Obtient la couleur associée à la force du mot de passe
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red'
    case 2:
      return 'orange'
    case 3:
      return 'yellow'
    case 4:
      return 'green'
    default:
      return 'gray'
  }
}
