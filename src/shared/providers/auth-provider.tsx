/**
 * Auth Provider - Version simplifiée
 * Gère uniquement la déconnexion (redirection)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    // Écouter uniquement SIGNED_OUT pour rediriger
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Clear all queries on logout
        queryClient.clear()
        router.push('/auth/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, queryClient])

  return <>{children}</>
}
