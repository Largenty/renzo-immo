/**
 * Admin Audit Logging
 * Tracks all admin actions for security and compliance
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Create admin client for bypassing RLS on audit log
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export interface LogAdminActionParams {
  adminId: string
  action: AdminAction
  resourceType: ResourceType
  resourceId?: string
  metadata?: Record<string, any>
  request?: Request | { headers: Headers }
}

export type AdminAction =
  // Furniture actions
  | 'create_furniture'
  | 'update_furniture'
  | 'delete_furniture'
  // Room actions
  | 'create_room'
  | 'update_room'
  | 'delete_room'
  // Style actions
  | 'create_style'
  | 'update_style'
  | 'delete_style'
  // User management
  | 'promote_admin'
  | 'demote_admin'
  | 'delete_user'
  // Other
  | 'view_audit_log'
  | 'export_data'

export type ResourceType =
  | 'furniture'
  | 'room'
  | 'style'
  | 'user'
  | 'audit_log'
  | 'system'

/**
 * Log an admin action to the audit log
 * This bypasses RLS to ensure logs are always written
 */
export async function logAdminAction({
  adminId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  request,
}: LogAdminActionParams): Promise<void> {
  try {
    // Extract IP and user agent from request if provided
    let ipAddress: string | null = null
    let userAgent: string | null = null

    if (request) {
      const headers = request.headers

      // Try multiple headers for IP (behind proxies/load balancers)
      ipAddress =
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        headers.get('x-client-ip') ||
        null

      userAgent = headers.get('user-agent')
    }

    // Insert into audit log using admin client (bypasses RLS)
    const { error } = await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) {
      logger.error('[Admin Audit] Failed to log action', {
        error,
        adminId,
        action,
        resourceType,
      })
    } else {
      logger.info('[Admin Audit] Action logged', {
        adminId,
        action,
        resourceType,
        resourceId,
        ipAddress,
      })
    }
  } catch (error) {
    // Never let audit logging crash the main request
    logger.error('[Admin Audit] Unexpected error', {
      error,
      adminId,
      action,
    })
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(limit: number = 100) {
  const { data, error } = await supabaseAdmin
    .from('admin_audit_log')
    .select(
      `
      id,
      created_at,
      action,
      resource_type,
      resource_id,
      metadata,
      ip_address,
      admin:users!admin_id (
        id,
        email
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('[Admin Audit] Failed to fetch logs', { error })
    return []
  }

  return data
}

/**
 * Get audit logs for a specific admin
 */
export async function getAdminAuditLogs(adminId: string, limit: number = 50) {
  const { data, error } = await supabaseAdmin
    .from('admin_audit_log')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('[Admin Audit] Failed to fetch admin logs', { error, adminId })
    return []
  }

  return data
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  limit: number = 20
) {
  const { data, error } = await supabaseAdmin
    .from('admin_audit_log')
    .select(
      `
      id,
      created_at,
      action,
      metadata,
      ip_address,
      admin:users!admin_id (
        id,
        email
      )
    `
    )
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('[Admin Audit] Failed to fetch resource logs', {
      error,
      resourceType,
      resourceId,
    })
    return []
  }

  return data
}

/**
 * Search audit logs by action or resource type
 */
export async function searchAuditLogs(
  filters: {
    action?: AdminAction
    resourceType?: ResourceType
    adminId?: string
    startDate?: Date
    endDate?: Date
  },
  limit: number = 100
) {
  let query = supabaseAdmin
    .from('admin_audit_log')
    .select(
      `
      id,
      created_at,
      action,
      resource_type,
      resource_id,
      metadata,
      ip_address,
      admin:users!admin_id (
        id,
        email
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.action) {
    query = query.eq('action', filters.action)
  }

  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }

  if (filters.adminId) {
    query = query.eq('admin_id', filters.adminId)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    logger.error('[Admin Audit] Failed to search logs', { error, filters })
    return []
  }

  return data
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogsCSV(
  filters: Parameters<typeof searchAuditLogs>[0]
): Promise<string> {
  const logs = await searchAuditLogs(filters, 10000) // Max 10k records

  // CSV header
  let csv = 'Timestamp,Admin Email,Action,Resource Type,Resource ID,IP Address,Metadata\n'

  // CSV rows
  for (const log of logs) {
    const timestamp = new Date(log.created_at).toISOString()
    const adminEmail = (log.admin as any)?.email || 'Unknown'
    const metadata = JSON.stringify(log.metadata).replace(/"/g, '""') // Escape quotes

    csv += `"${timestamp}","${adminEmail}","${log.action}","${log.resource_type}","${log.resource_id || ''}","${log.ip_address || ''}","${metadata}"\n`
  }

  return csv
}
