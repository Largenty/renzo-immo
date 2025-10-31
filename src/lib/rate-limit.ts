/**
 * Rate Limiting avec Upstash Redis
 * Protège les API routes contre les abus et attaques DoS
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'
import { detectRateLimitAbuse } from './monitoring/security-alerts'

// Initialiser Redis depuis les variables d'environnement
// Vérifier que les variables d'environnement sont définies
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// Vérifier si Redis est configuré
const isRedisConfigured = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)

if (!isRedisConfigured) {
  logger.warn('[Rate Limit] Redis not configured - rate limiting disabled')
  logger.warn('[Rate Limit] Missing environment variables:')
  logger.warn('  - UPSTASH_REDIS_REST_URL:', UPSTASH_REDIS_REST_URL ? '✓' : '✗')
  logger.warn('  - UPSTASH_REDIS_REST_TOKEN:', UPSTASH_REDIS_REST_TOKEN ? '✓' : '✗')
  logger.warn('[Rate Limit] See .env.example for reference')
}

// Créer Redis seulement si configuré
const redis = isRedisConfigured
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL!,
      token: UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

/**
 * Rate limiter pour la génération d'images
 * Limite: 10 requêtes par 10 secondes par utilisateur
 *
 * Raison: La génération d'images est une opération coûteuse qui:
 * - Consomme des crédits utilisateur
 * - Appelle l'API NanoBanana (coûteuse)
 * - Peut prendre plusieurs secondes
 */
export const generateImageLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'ratelimit:generate-image',
    })
  : null

/**
 * Rate limiter pour la vérification du statut
 * Limite: 30 requêtes par 10 secondes par utilisateur
 *
 * Raison: Le polling du statut est moins coûteux mais peut être spammé:
 * - Requêtes rapides répétées
 * - Charge sur la base de données
 * - Limite plus permissive pour permettre un polling fréquent
 */
export const statusCheckLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '10 s'),
      analytics: true,
      prefix: 'ratelimit:status-check',
    })
  : null

/**
 * Rate limiter pour les tentatives de login
 * Limite: 5 requêtes par 15 minutes par IP
 *
 * Raison: Protection contre le brute force:
 * - Tentatives de deviner des mots de passe
 * - Attaques par dictionnaire
 * - Limite stricte pour la sécurité des comptes
 */
export const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:login',
    })
  : null

/**
 * Rate limiter pour les inscriptions
 * Limite: 3 requêtes par heure par IP
 *
 * Raison: Prévient la création de comptes en masse:
 * - Spam de comptes
 * - Abus du système de crédits gratuits
 * - Protection de la base de données
 */
export const signupLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:signup',
    })
  : null

/**
 * Utility function pour vérifier le rate limit et retourner une réponse standardisée
 * Si Redis n'est pas configuré, retourne success: true (pas de limitation)
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  // Si pas de limiter configuré (Redis indisponible), autoriser la requête
  if (!limiter) {
    logger.warn('[Rate Limit] Bypassing rate limit check - Redis not configured')
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset,
    }
  } catch (error) {
    // En cas d'erreur Redis (service down, network issue, etc.), autoriser la requête
    logger.error('[Rate Limit] Error checking rate limit, allowing request:', error)
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    }
  }
}

/**
 * Helper pour extraire l'IP du client depuis les headers Next.js
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Rate limiting progressif avec pénalités
 * Plus un user échoue, plus sa limite devient stricte
 */
export async function checkProgressiveRateLimit(
  userId: string,
  endpoint: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  penalty?: number
}> {
  if (!redis) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    }
  }

  const failureKey = `rate-limit:failures:${userId}:${endpoint}`

  try {
    // Récupérer le nombre d'échecs récents
    const failures = (await redis.get<number>(failureKey)) || 0

    // Calculer la limite basée sur les échecs
    let limit = 60 // Normal: 60 req/min
    if (failures > 5) limit = 30 // Suspicious: 30 req/min
    if (failures > 10) limit = 10 // Very suspicious: 10 req/min
    if (failures > 20) limit = 1 // Blocked: 1 req/min

    // Créer un limiter avec la limite ajustée
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, '1 m'),
      prefix: `ratelimit:progressive:${userId}`,
    })

    const result = await limiter.limit(userId)

    // Si échec, incrémenter le compteur
    if (!result.success) {
      await redis.incr(failureKey)
      await redis.expire(failureKey, 3600) // Reset après 1h

      const newFailures = failures + 1

      // 🚨 SECURITY ALERT: Détection d'abus si trop d'échecs
      if (newFailures > 10) {
        detectRateLimitAbuse(userId, endpoint, newFailures)
      }

      return {
        ...result,
        penalty: newFailures,
      }
    }

    return result
  } catch (error) {
    logger.error('[Progressive Rate Limit] Error:', error)
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    }
  }
}
