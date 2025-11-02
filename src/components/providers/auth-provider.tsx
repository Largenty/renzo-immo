/**
 * Auth Provider - Version simplifiée
 * Gère uniquement la déconnexion (redirection)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const clearUser = useAuthStore((state) => state.clearUser)

  useEffect(() => {
    const supabase = createClient()

    // Écouter uniquement SIGNED_OUT pour rediriger
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearUser()
        router.push('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, clearUser])

  return <>{children}</>
}
