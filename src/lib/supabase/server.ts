/**
 * Supabase Server Client
 * À utiliser dans les Server Components, API Routes et Server Actions
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // La méthode `setAll` est appelée depuis un Server Component.
            // Ceci peut être ignoré si vous avez un middleware qui refresh les cookies.
          }
        },
      },
    }
  )
}

/**
 * Supabase Admin Client (Service Role)
 * ⚠️ ATTENTION: À utiliser UNIQUEMENT côté serveur
 * Ne JAMAIS exposer la service_role_key côté client !
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
