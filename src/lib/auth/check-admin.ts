/**
 * Vérification des droits administrateur
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logger';
import { detectUnauthorizedAdminAccess } from '../monitoring/security-alerts';

/**
 * Vérifie si un utilisateur est administrateur
 *
 * IMPORTANT: Cette fonction vérifie le rôle dans la table users
 * Assurez-vous que votre table users a une colonne 'role' avec la valeur 'admin'
 */
export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('[isUserAdmin] Error fetching user role', { userId, error });
      return false;
    }

    return user?.role === 'admin';
  } catch (error) {
    logger.error('[isUserAdmin] Unexpected error', { userId, error });
    return false;
  }
}

/**
 * Middleware pour vérifier qu'un utilisateur est admin
 * Retourne une réponse JSON 403 si l'utilisateur n'est pas admin
 *
 * @example
 * const adminCheck = await requireAdmin(supabase, user.id);
 * if (adminCheck.error) return adminCheck.response;
 */
export async function requireAdmin(
  supabase: SupabaseClient,
  userId: string,
  endpoint?: string,
  ip?: string
): Promise<{ isAdmin: boolean; error?: string; response?: Response }> {
  const isAdmin = await isUserAdmin(supabase, userId);

  if (!isAdmin) {
    logger.warn('[requireAdmin] Unauthorized admin access attempt', { userId, endpoint });

    // 🚨 SECURITY ALERT: Tentative d'accès admin non autorisée
    if (endpoint) {
      detectUnauthorizedAdminAccess(userId, endpoint, ip);
    }

    return {
      isAdmin: false,
      error: 'Forbidden: Admin rights required',
      response: Response.json(
        { error: 'Forbidden: Admin rights required' },
        { status: 403 }
      ),
    };
  }

  return { isAdmin: true };
}

/**
 * Vérifie si un utilisateur a le droit d'accéder à une ressource (ownership)
 */
export async function checkResourceOwnership(
  supabase: SupabaseClient,
  tableName: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('user_id')
      .eq('id', resourceId)
      .single();

    if (error) {
      logger.error('[checkResourceOwnership] Error fetching resource', {
        tableName,
        resourceId,
        error,
      });
      return false;
    }

    return data?.user_id === userId;
  } catch (error) {
    logger.error('[checkResourceOwnership] Unexpected error', {
      tableName,
      resourceId,
      error,
    });
    return false;
  }
}
