/**
 * Gestion des erreurs contextuelles
 * Fournit des messages d'erreur clairs et actionnables pour l'utilisateur
 */

export enum ErrorCode {
  // Erreurs d'upload
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",

  // Erreurs d'authentification
  UNAUTHORIZED = "UNAUTHORIZED",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Erreurs de génération
  GENERATION_FAILED = "GENERATION_FAILED",
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS",
  API_ERROR = "API_ERROR",

  // Erreurs de réseau
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",

  // Erreurs de données
  NOT_FOUND = "NOT_FOUND",
  INVALID_DATA = "INVALID_DATA",

  // Erreurs génériques
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface AppError {
  code: ErrorCode;
  message: string;
  description?: string;
  action?: string;
}

/**
 * Messages d'erreur contextuels avec descriptions et actions suggérées
 */
const ERROR_MESSAGES: Record<ErrorCode, Omit<AppError, "code">> = {
  [ErrorCode.FILE_TOO_LARGE]: {
    message: "Fichier trop volumineux",
    description: "La taille maximale autorisée est de 10 MB. Veuillez compresser votre image.",
    action: "Réduire la taille de l'image",
  },
  [ErrorCode.INVALID_FILE_TYPE]: {
    message: "Format de fichier non supporté",
    description: "Formats acceptés : JPG, PNG, WebP",
    action: "Convertir l'image au bon format",
  },
  [ErrorCode.UPLOAD_FAILED]: {
    message: "Échec de l'upload",
    description: "L'image n'a pas pu être téléchargée. Vérifiez votre connexion.",
    action: "Réessayer",
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: "Non autorisé",
    description: "Vous devez être connecté pour effectuer cette action.",
    action: "Se connecter",
  },
  [ErrorCode.SESSION_EXPIRED]: {
    message: "Session expirée",
    description: "Votre session a expiré. Veuillez vous reconnecter.",
    action: "Se reconnecter",
  },
  [ErrorCode.GENERATION_FAILED]: {
    message: "Échec de la génération",
    description: "L'IA n'a pas pu générer l'image. Veuillez réessayer avec une autre photo ou un autre style.",
    action: "Réessayer avec une autre configuration",
  },
  [ErrorCode.INSUFFICIENT_CREDITS]: {
    message: "Crédits insuffisants",
    description: "Vous n'avez plus de crédits disponibles pour générer des images.",
    action: "Acheter des crédits",
  },
  [ErrorCode.API_ERROR]: {
    message: "Erreur API",
    description: "Une erreur est survenue lors de la communication avec le serveur.",
    action: "Réessayer dans quelques instants",
  },
  [ErrorCode.NETWORK_ERROR]: {
    message: "Erreur réseau",
    description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
    action: "Vérifier la connexion",
  },
  [ErrorCode.TIMEOUT]: {
    message: "Délai dépassé",
    description: "La requête a pris trop de temps. Le serveur est peut-être surchargé.",
    action: "Réessayer",
  },
  [ErrorCode.NOT_FOUND]: {
    message: "Ressource introuvable",
    description: "L'élément demandé n'existe pas ou a été supprimé.",
    action: "Revenir en arrière",
  },
  [ErrorCode.INVALID_DATA]: {
    message: "Données invalides",
    description: "Les données fournies sont incorrectes ou incomplètes.",
    action: "Vérifier les informations",
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    message: "Erreur inconnue",
    description: "Une erreur inattendue est survenue.",
    action: "Réessayer ou contacter le support",
  },
};

/**
 * Créer une erreur applicative avec un code et un contexte
 */
export function createAppError(code: ErrorCode, customMessage?: string): AppError {
  const baseError = ERROR_MESSAGES[code];
  return {
    code,
    message: customMessage || baseError.message,
    description: baseError.description,
    action: baseError.action,
  };
}

/**
 * Déterminer le code d'erreur depuis une erreur native
 */
export function getErrorCode(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Erreurs de fichier
    if (message.includes("file") && message.includes("large")) {
      return ErrorCode.FILE_TOO_LARGE;
    }
    if (message.includes("file") && message.includes("type")) {
      return ErrorCode.INVALID_FILE_TYPE;
    }

    // Erreurs d'authentification
    if (message.includes("unauthorized") || message.includes("unauthenticated")) {
      return ErrorCode.UNAUTHORIZED;
    }
    if (message.includes("session") || message.includes("expired")) {
      return ErrorCode.SESSION_EXPIRED;
    }

    // Erreurs de crédits
    if (message.includes("credit") || message.includes("insufficient")) {
      return ErrorCode.INSUFFICIENT_CREDITS;
    }

    // Erreurs de réseau
    if (message.includes("network") || message.includes("fetch")) {
      return ErrorCode.NETWORK_ERROR;
    }
    if (message.includes("timeout")) {
      return ErrorCode.TIMEOUT;
    }

    // Erreurs de données
    if (message.includes("not found")) {
      return ErrorCode.NOT_FOUND;
    }
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Convertir une erreur native en AppError
 */
export function parseError(error: unknown): AppError {
  const code = getErrorCode(error);
  const customMessage = error instanceof Error ? error.message : undefined;
  return createAppError(code, customMessage);
}

/**
 * Formater une erreur pour l'affichage dans un toast
 */
export function formatErrorForToast(error: unknown): { title: string; description?: string } {
  const appError = parseError(error);
  return {
    title: appError.message,
    description: appError.description,
  };
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors are retryable
    if (message.includes('network') || message.includes('fetch')) return true;
    if (message.includes('timeout')) return true;
    if (message.includes('502') || message.includes('503') || message.includes('504')) return true;

    // API rate limits are retryable
    if (message.includes('rate limit') || message.includes('429')) return true;
  }

  return false;
}

/**
 * Exponential backoff delay calculation
 * @param attemptNumber - The current retry attempt (starts at 0)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @param maxDelay - Maximum delay in milliseconds (default: 30000ms)
 */
export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  // Add jitter (random 0-25% variation) to prevent thundering herd
  const jitter = delay * 0.25 * Math.random();
  return Math.floor(delay + jitter);
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param shouldRetry - Custom function to determine if error is retryable
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  shouldRetry: (error: unknown) => boolean = isRetryableError
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or if last attempt
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = calculateBackoffDelay(attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Parse Supabase error messages to be more user-friendly
 */
export function parseSupabaseError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase();

    // RLS policy violations
    if (message.includes('row level security') || message.includes('policy')) {
      return createAppError(ErrorCode.UNAUTHORIZED, 'Accès non autorisé à cette ressource');
    }

    // Foreign key violations
    if (message.includes('foreign key') || message.includes('violates')) {
      return createAppError(ErrorCode.INVALID_DATA, 'Données liées manquantes ou invalides');
    }

    // Unique constraint violations
    if (message.includes('duplicate') || message.includes('unique')) {
      return createAppError(ErrorCode.INVALID_DATA, 'Cette ressource existe déjà');
    }

    // Connection errors
    if (message.includes('connection') || message.includes('econnrefused')) {
      return createAppError(ErrorCode.NETWORK_ERROR, 'Impossible de se connecter à la base de données');
    }
  }

  return parseError(error);
}
