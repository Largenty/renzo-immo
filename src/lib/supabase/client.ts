/**
 * Supabase Client (Client-side)
 * À utiliser dans les composants client Next.js
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export singleton pour utilisation simple
export const supabase = createClient()
