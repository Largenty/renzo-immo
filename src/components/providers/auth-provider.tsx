/**
 * Auth Provider
 * Synchronise l'état Supabase avec React Query et Zustand Store
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/stores/auth-store'
import { logger } from '@/lib/logger';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)
  const clearUser = useAuthStore(state => state.clearUser)

  useEffect(() => {
    const supabase = createClient()

    // Écouter UNIQUEMENT les changements de connexion/déconnexion
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('🔔 Auth state change:', event, 'has session:', !!session)

      // SIGNED_IN : utilisateur vient de se connecter
      if (event === 'SIGNED_IN') {
        logger.debug('🎉 User signed in, syncing stores')

        // Invalider React Query
        queryClient.invalidateQueries({ queryKey: ['current-user'] })

        // Synchroniser Zustand Store
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              avatarUrl: userData.avatar_url,
              phone: userData.phone,
              company: userData.company,
              address: userData.address,
            })
          }
        }
      }
      // SIGNED_OUT : utilisateur vient de se déconnecter
      else if (event === 'SIGNED_OUT') {
        logger.debug('👋 User signed out, clearing cache')
        queryClient.clear()
        clearUser()
        router.push('/auth/login')
      }
      // Ignorer INITIAL_SESSION, TOKEN_REFRESHED, etc. pour éviter les boucles
    })

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [router, queryClient, setUser, clearUser])

  return <>{children}</>
}
