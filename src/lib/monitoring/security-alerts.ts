/**
 * Security Alerts & Monitoring
 * Détecte et alerte sur les activités suspectes
 */

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

export interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip?: string
  userAgent?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export type SecurityEventType =
  // Authentication
  | 'failed_login_attempt'
  | 'suspicious_login_location'
  | 'multiple_failed_logins'
  // Rate limiting
  | 'rate_limit_exceeded'
  | 'rate_limit_abuse'
  // Admin actions
  | 'unauthorized_admin_access'
  | 'suspicious_admin_action'
  // API abuse
  | 'api_abuse_detected'
  | 'unusual_api_pattern'
  // Data access
  | 'unauthorized_data_access'
  | 'mass_data_download'
  // Other
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'

/**
 * Alert sur une activité suspecte
 * Envoie à Sentry + logs
 */
export function alertSecurityEvent(event: SecurityEvent): void {
  // Log local
  logger.warn(`[Security Alert] ${event.type}`, {
    ...event.details,
    userId: event.userId,
    ip: event.ip,
    severity: event.severity,
  })

  // Envoyer à Sentry avec contexte
  Sentry.captureMessage(`Security Alert: ${event.type}`, {
    level: mapSeverityToSentryLevel(event.severity),
    tags: {
      security_event: event.type,
      severity: event.severity,
    },
    user: event.userId
      ? {
          id: event.userId,
          ip_address: event.ip,
        }
      : undefined,
    extra: {
      ...event.details,
      user_agent: event.userAgent,
      timestamp: new Date().toISOString(),
    },
    fingerprint: [event.type, event.userId || 'anonymous'],
  })

  // Si critique, envoyer une notification immédiate
  if (event.severity === 'critical') {
    Sentry.captureException(
      new Error(`CRITICAL SECURITY EVENT: ${event.type}`),
      {
        tags: {
          security_critical: 'true',
        },
        extra: event.details,
      }
    )
  }
}

/**
 * Détecte les tentatives de rate limit abuse
 */
export function detectRateLimitAbuse(
  userId: string,
  endpoint: string,
  failureCount: number
): void {
  if (failureCount > 10) {
    alertSecurityEvent({
      type: 'rate_limit_abuse',
      userId,
      severity: failureCount > 50 ? 'high' : 'medium',
      details: {
        endpoint,
        failure_count: failureCount,
        threshold_exceeded: failureCount / 10,
      },
    })
  }
}

/**
 * Détecte les tentatives d'accès admin non autorisées
 */
export function detectUnauthorizedAdminAccess(
  userId: string,
  endpoint: string,
  ip?: string
): void {
  alertSecurityEvent({
    type: 'unauthorized_admin_access',
    userId,
    ip,
    severity: 'high',
    details: {
      endpoint,
      action: 'admin_access_denied',
      reason: 'User is not admin',
    },
  })
}

/**
 * Détecte les actions admin suspectes
 */
export function detectSuspiciousAdminAction(
  adminId: string,
  action: string,
  details: Record<string, any>
): void {
  // Actions considérées comme suspectes
  const suspiciousActions = [
    'delete_user',
    'promote_admin',
    'demote_admin',
    'mass_delete',
    'export_data',
  ]

  if (suspiciousActions.includes(action)) {
    alertSecurityEvent({
      type: 'suspicious_admin_action',
      userId: adminId,
      severity: 'medium',
      details: {
        action,
        ...details,
      },
    })
  }
}

/**
 * Détecte les patterns d'API abuse
 */
export function detectApiAbuse(
  userId: string,
  endpoint: string,
  requestCount: number,
  timeWindowMinutes: number
): void {
  // Seuils normaux (ajuster selon ton app)
  const thresholds: Record<string, number> = {
    '/api/generate-image': 20, // 20 req / timeWindow = suspect
    '/api/check-generation-status': 100,
    '/api/furniture': 50,
    '/api/rooms': 50,
  }

  const threshold = thresholds[endpoint] || 50
  const requestsPerMinute = requestCount / timeWindowMinutes

  if (requestCount > threshold) {
    alertSecurityEvent({
      type: 'api_abuse_detected',
      userId,
      severity: requestsPerMinute > threshold * 2 ? 'high' : 'medium',
      details: {
        endpoint,
        request_count: requestCount,
        time_window_minutes: timeWindowMinutes,
        requests_per_minute: requestsPerMinute.toFixed(2),
        threshold_exceeded: (requestCount / threshold).toFixed(2) + 'x',
      },
    })
  }
}

/**
 * Détecte les tentatives d'injection SQL (patterns basiques)
 */
export function detectSqlInjectionAttempt(
  userId: string | undefined,
  input: string,
  endpoint: string
): void {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL meta-characters
    /(((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;)))/i, // Typical SQL injection
    /(\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52)))/i, // OR keyword
    /(((\%27)|(\'))union)/i, // UNION keyword
    /exec(\s|\+)+(s|x)p\w+/i, // Stored procedures
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      alertSecurityEvent({
        type: 'sql_injection_attempt',
        userId,
        severity: 'high',
        details: {
          endpoint,
          input_sample: input.substring(0, 100), // Premiers 100 chars
          pattern_matched: pattern.toString(),
        },
      })
      break
    }
  }
}

/**
 * Détecte les tentatives XSS (patterns basiques)
 */
export function detectXssAttempt(
  userId: string | undefined,
  input: string,
  endpoint: string
): void {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi, // Script tags
    /javascript:/gi, // javascript: protocol
    /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers (onclick, onerror, etc.)
    /<iframe[^>]*>/gi, // Iframe tags
    /<embed[^>]*>/gi, // Embed tags
    /<object[^>]*>/gi, // Object tags
  ]

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      alertSecurityEvent({
        type: 'xss_attempt',
        userId,
        severity: 'high',
        details: {
          endpoint,
          input_sample: input.substring(0, 100),
          pattern_matched: pattern.toString(),
        },
      })
      break
    }
  }
}

/**
 * Détecte un téléchargement massif de données
 */
export function detectMassDataDownload(
  userId: string,
  resourceType: string,
  itemCount: number
): void {
  const thresholds: Record<string, number> = {
    furniture: 100,
    rooms: 50,
    images: 200,
    projects: 50,
  }

  const threshold = thresholds[resourceType] || 100

  if (itemCount > threshold) {
    alertSecurityEvent({
      type: 'mass_data_download',
      userId,
      severity: 'medium',
      details: {
        resource_type: resourceType,
        item_count: itemCount,
        threshold,
        ratio: (itemCount / threshold).toFixed(2) + 'x',
      },
    })
  }
}

/**
 * Map severity to Sentry level
 */
function mapSeverityToSentryLevel(
  severity: SecurityEvent['severity']
): Sentry.SeverityLevel {
  switch (severity) {
    case 'low':
      return 'info'
    case 'medium':
      return 'warning'
    case 'high':
      return 'error'
    case 'critical':
      return 'fatal'
  }
}

/**
 * Get security metrics for dashboard
 */
export interface SecurityMetrics {
  total_events: number
  events_by_type: Record<SecurityEventType, number>
  events_by_severity: Record<SecurityEvent['severity'], number>
  top_affected_users: Array<{ userId: string; count: number }>
}

/**
 * Export security events to CSV (for compliance/audit)
 */
export function exportSecurityEventsCSV(
  events: SecurityEvent[],
  startDate: Date,
  endDate: Date
): string {
  let csv = 'Timestamp,Type,Severity,User ID,IP,Details\n'

  for (const event of events) {
    const details = JSON.stringify(event.details).replace(/"/g, '""')
    csv += `"${new Date().toISOString()}","${event.type}","${event.severity}","${event.userId || ''}","${event.ip || ''}","${details}"\n`
  }

  return csv
}
