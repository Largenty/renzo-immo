/**
 * Messages d'erreur OAuth centralisés
 * Utilisés dans login/page.tsx et signup/page.tsx
 */
export const AUTH_ERROR_MESSAGES = {
  auth_failed: "Échec de l'authentification. Veuillez réessayer.",
  no_email: "Email manquant ou invalide. Contactez le support.",
  user_check_failed: "Erreur lors de la vérification du compte.",
  user_creation_failed:
    "Erreur lors de la création du compte. Veuillez réessayer.",
  no_code: "Code d'authentification manquant.",
  email_already_exists:
    "Un compte existe déjà avec cet email. Essayez de vous connecter.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;
