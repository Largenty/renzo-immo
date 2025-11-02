/**
 * Supabase Client (Client-side)
 * À utiliser dans les composants client Next.js
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[Supabase Client] Creating client with:', {
    hasUrl: !!url,
    hasKey: !!key,
    urlPreview: url ? url.substring(0, 30) + '...' : 'undefined'
  });

  if (!url || !key) {
    console.error('[Supabase Client] Missing env vars!', { url, key });
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(url, key)
}

// Export singleton pour utilisation simple
export const supabase = createClient()
