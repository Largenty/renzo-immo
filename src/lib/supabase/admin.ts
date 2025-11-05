/**
 * Supabase Admin Client (Service Role)
 *
 * ⚠️ ATTENTION: Ce client bypasse Row Level Security (RLS)
 * À utiliser UNIQUEMENT dans les API routes côté serveur pour:
 * - Les opérations admin
 * - Les opérations qui nécessitent de bypasser RLS (après vérification des permissions)
 *
 * ❌ NE JAMAIS exposer ce client côté client
 * ❌ NE JAMAIS utiliser sans vérification préalable des permissions
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Client Supabase avec Service Role Key
 * Ce client bypasse toutes les politiques RLS
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
