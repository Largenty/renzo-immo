import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * Vérifie si l'utilisateur est admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.user_metadata?.role === "admin";
}

/**
 * Middleware: Vérifie que l'utilisateur est admin
 * Retourne une réponse 403 si non-admin
 */
export function requireAdmin(user: User | null): NextResponse | null {
  if (!user) {
    logger.warn("Unauthorized access attempt - no user");
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  if (!isAdmin(user)) {
    logger.warn(`Forbidden access attempt by user ${user.id} - not admin`);
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access required" },
      { status: 403 }
    );
  }

  return null; // Permission accordée
}

/**
 * Middleware: Vérifie que l'utilisateur est propriétaire OU admin
 * Retourne une réponse 403 si ni propriétaire ni admin
 */
export function requireOwnerOrAdmin(
  user: User | null,
  resourceOwnerId: string | null | undefined
): NextResponse | null {
  if (!user) {
    logger.warn("Unauthorized access attempt - no user");
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // Ressource par défaut (user_id = null) → admin uniquement
  if (!resourceOwnerId) {
    if (!isAdmin(user)) {
      logger.warn(
        `Forbidden: User ${user.id} attempted to modify default resource (admin only)`
      );
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only admins can modify default resources",
        },
        { status: 403 }
      );
    }
    return null; // Admin peut modifier les ressources par défaut
  }

  // Ressource personnalisée → propriétaire OU admin
  const isOwner = resourceOwnerId === user.id;
  const isUserAdmin = isAdmin(user);

  if (!isOwner && !isUserAdmin) {
    logger.warn(
      `Forbidden: User ${user.id} attempted to access resource owned by ${resourceOwnerId}`
    );
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "You can only modify your own resources",
      },
      { status: 403 }
    );
  }

  return null; // Permission accordée
}

/**
 * Middleware: Vérifie que l'utilisateur peut créer une ressource par défaut
 * Pour les POST/PUT où user_id peut être null
 */
export function checkDefaultResourceCreation(
  user: User | null,
  requestedUserId: string | null | undefined
): NextResponse | null {
  if (!user) {
    logger.warn("Unauthorized creation attempt - no user");
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // Si user_id = null dans le body → admin uniquement
  if (!requestedUserId) {
    if (!isAdmin(user)) {
      logger.warn(
        `Forbidden: User ${user.id} attempted to create default resource (admin only)`
      );
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only admins can create default resources",
        },
        { status: 403 }
      );
    }
    return null; // Admin peut créer ressource par défaut
  }

  // Si user_id fourni, vérifier que c'est bien l'utilisateur connecté (sauf admin)
  if (requestedUserId !== user.id && !isAdmin(user)) {
    logger.warn(
      `Forbidden: User ${user.id} attempted to create resource for user ${requestedUserId}`
    );
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "You can only create resources for yourself",
      },
      { status: 403 }
    );
  }

  return null; // Permission accordée
}
