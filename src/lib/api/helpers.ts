/**
 * API Helpers
 * Fonctions utilitaires réutilisables pour les routes API
 */

import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * Erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Vérifie l'authentification et retourne l'utilisateur
 *
 * @throws {ApiError} Si l'utilisateur n'est pas authentifié
 *
 * @example
 * const user = await requireAuth(supabase);
 * // user est garanti d'être défini ici
 */
export async function requireAuth(
  supabase: SupabaseClient
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logger.error("[requireAuth] Auth error", { error });
    throw new ApiError("Authentication failed", 401);
  }

  if (!user) {
    throw new ApiError("Unauthorized", 401);
  }

  return user;
}

/**
 * Vérifie que l'email de l'utilisateur est confirmé
 *
 * @throws {ApiError} Si l'email n'est pas confirmé
 *
 * @example
 * const user = await requireAuth(supabase);
 * await requireEmailVerification(user);
 */
export async function requireEmailVerification(user: User): Promise<void> {
  if (!user.confirmed_at) {
    throw new ApiError(
      "Email verification required",
      403,
      "Please verify your email before accessing this resource"
    );
  }
}

/**
 * Valide qu'un chemin de redirection est sûr (pas d'Open Redirect)
 *
 * @param path - Le chemin à valider
 * @returns true si le chemin est sûr, false sinon
 *
 * @example
 * const next = isValidRedirectPath(rawNext) ? rawNext : "/dashboard";
 */
export function isValidRedirectPath(path: string): boolean {
  // Doit commencer par / mais pas //
  // Ne doit pas contenir de protocole (http://, https://, etc.)
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("://") &&
    !path.includes("\\")
  );
}

/**
 * Valide qu'un email est présent et valide
 *
 * @throws {ApiError} Si l'email est manquant ou invalide
 */
export function requireEmail(email: string | null | undefined): string {
  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  // Validation basique d'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError("Invalid email format", 400);
  }

  return email;
}

/**
 * Helper pour la pagination
 *
 * @param searchParams - Les paramètres de recherche de l'URL
 * @param defaultLimit - Limite par défaut (défaut: 50)
 * @param maxLimit - Limite maximale (défaut: 100)
 * @returns Objet contenant page, limit, et offset
 *
 * @example
 * const { page, limit, offset } = getPagination(request.nextUrl.searchParams);
 * const { data, count } = await supabase
 *   .from('table')
 *   .select('*', { count: 'exact' })
 *   .range(offset, offset + limit - 1);
 */
export function getPagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 50,
  maxLimit: number = 100
) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit)))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Formate la réponse de pagination
 *
 * @example
 * return NextResponse.json({
 *   data: items,
 *   pagination: formatPaginationResponse(page, limit, totalCount)
 * });
 */
export function formatPaginationResponse(
  page: number,
  limit: number,
  totalCount: number | null
) {
  const total = totalCount || 0;
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

/**
 * Wrapper pour gérer les erreurs de manière uniforme
 *
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   const supabase = await createClient();
 *   const user = await requireAuth(supabase);
 *   // ... logique métier
 *   return NextResponse.json({ data });
 * }, 'GET /api/furniture');
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  routeName: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Si c'est une ApiError, retourner le status et message appropriés
      if (error instanceof ApiError) {
        logger.warn(`[${routeName}] API Error`, {
          message: error.message,
          status: error.status,
          details: error.details,
        });

        return NextResponse.json(
          {
            error: error.message,
            ...(error.details && { details: error.details }),
          },
          { status: error.status }
        );
      }

      // Erreur inattendue
      logger.error(`[${routeName}] Unexpected error`, { error });

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper pour vérifier la propriété d'une ressource
 *
 * @throws {ApiError} Si la ressource n'appartient pas à l'utilisateur
 */
export async function requireOwnership(
  supabase: SupabaseClient,
  tableName: string,
  resourceId: string,
  userId: string,
  resourceName: string = "Resource"
): Promise<void> {
  const { data, error } = await supabase
    .from(tableName)
    .select("user_id")
    .eq("id", resourceId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new ApiError(`${resourceName} not found`, 404);
    }
    logger.error(`[requireOwnership] Database error`, { error });
    throw new ApiError(`Failed to verify ${resourceName.toLowerCase()} ownership`, 500);
  }

  if (data.user_id !== userId) {
    throw new ApiError("Forbidden", 403);
  }
}
