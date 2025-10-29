/**
 * Auth Provider
 * Synchronise l'état Supabase avec le store Zustand
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, type UserData } from '@/lib/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setSession, setLoading, setInitialized, reset } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Fonction pour récupérer et synchroniser l'utilisateur
    const syncUser = async () => {
      try {
        console.log('🔄 AuthProvider: Starting syncUser...')
        setLoading(true)

        // Récupérer la session Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log('🔐 AuthProvider: Session fetched:', !!session, 'User:', !!session?.user)

        if (session?.user) {
          console.log('👤 AuthProvider: Fetching user data for ID:', session.user.id)

          // Récupérer les données complètes depuis notre table users
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          console.log('📊 AuthProvider: User data fetched:', !!userData, 'Error:', error)

          if (!error && userData) {
            console.log('✅ AuthProvider: Setting user and session')
            setUser(userData as UserData)
            setSession(session)
          } else {
            console.error('❌ AuthProvider: Error fetching user data:', error)
            reset()
          }
        } else {
          console.log('⚠️ AuthProvider: No session found, resetting')
          reset()
        }
      } catch (error) {
        console.error('💥 AuthProvider: Error syncing user:', error)
        reset()
      } finally {
        console.log('🏁 AuthProvider: Sync complete, setting initialized to true')
        setLoading(false)
        setInitialized(true)
      }
    }

    // Synchroniser au montage
    syncUser()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state change:', event, 'session:', !!session)

      if (event === 'INITIAL_SESSION' && session?.user) {
        console.log('🎉 Initial session detected, fetching user data')
        // Récupérer les données utilisateur pour la session initiale
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          console.log('✅ Setting user from INITIAL_SESSION')
          setUser(userData as UserData)
          setSession(session)
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('🎉 Sign in detected, fetching user data')
        // Récupérer les données utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          console.log('✅ Setting user from SIGNED_IN')
          setUser(userData as UserData)
          setSession(session)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Sign out detected')
        reset()
        router.push('/auth/login')
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed')
        setSession(session)
      } else if (event === 'USER_UPDATED' && session?.user) {
        console.log('👤 User updated')
        // Recharger les données utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          setUser(userData as UserData)
        }
      }
    })

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setLoading, setInitialized, reset, router])

  return <>{children}</>
}
