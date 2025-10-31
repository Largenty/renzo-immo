/**
 * Types communs pour l'application
 */

// Type pour les erreurs Supabase et génériques
export interface AppError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Type pour les erreurs avec stack trace
export interface ErrorWithStack extends Error {
  stack?: string;
  cause?: unknown;
}

// Type générique pour les réponses d'API avec erreur
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// Helper type pour unknown errors
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Helper pour extraire un message d'erreur depuis n'importe quel type
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inconnue est survenue';
}
