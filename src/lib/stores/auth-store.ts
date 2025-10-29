/**
 * Auth Store - Zustand
 * Gère l'état global de l'authentification côté client
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'

export interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  company?: string
  email_verified: boolean
  credits_balance: number
  subscription_plan_id?: string
  created_at: string
}

interface AuthState {
  // État
  user: UserData | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setUser: (user: UserData | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  updateUser: (updates: Partial<UserData>) => void
  updateCredits: (amount: number) => void
  reset: () => void
}

/**
 * Store d'authentification avec persistance
 * Sauvegarde la session et les données utilisateur dans localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,

      // Définir l'utilisateur
      setUser: (user) => {
        console.log('🔥 AuthStore: setUser called, user:', !!user)
        set({ user, isLoading: false })
      },

      // Définir la session
      setSession: (session) => {
        console.log('🔥 AuthStore: setSession called, session:', !!session)
        set({ session })
      },

      // Définir l'état de chargement
      setLoading: (isLoading) => {
        console.log('🔥 AuthStore: setLoading called, isLoading:', isLoading)
        set({ isLoading })
      },

      // Marquer comme initialisé
      setInitialized: (isInitialized) => {
        console.log('🔥 AuthStore: setInitialized called, isInitialized:', isInitialized)
        set({ isInitialized })
      },

      // Mettre à jour partiellement l'utilisateur
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },

      // Mettre à jour le solde de crédits
      updateCredits: (amount) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              credits_balance: currentUser.credits_balance + amount,
            },
          })
        }
      },

      // Réinitialiser le store (lors de la déconnexion)
      reset: () => {
        set({
          user: null,
          session: null,
          isLoading: false,
          isInitialized: true,
        })
      },
    }),
    {
      name: 'renzo-auth-storage', // Nom de la clé dans localStorage
      storage: createJSONStorage(() => localStorage),
      // Ne persister que les données essentielles
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      // Callback après hydratation depuis localStorage
      onRehydrateStorage: () => (state) => {
        console.log('💾 AuthStore: onRehydrateStorage called, state:', !!state)
        // Après hydratation, on force isLoading à true et isInitialized à false
        // pour que le AuthProvider puisse vérifier la session
        if (state) {
          console.log('💾 AuthStore: Forcing isLoading=true, isInitialized=false after hydration')
          console.log('💾 AuthStore: Before - user:', !!state.user, 'session:', !!state.session, 'isInitialized:', state.isInitialized)
          state.isLoading = true
          state.isInitialized = false
          console.log('💾 AuthStore: After - isLoading:', state.isLoading, 'isInitialized:', state.isInitialized)
        }
      },
    }
  )
)

/**
 * Sélecteurs utiles
 */
export const useUser = () => useAuthStore((state) => state.user)
export const useSession = () => useAuthStore((state) => state.session)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.session && !!state.user)
export const useCreditsBalance = () => useAuthStore((state) => state.user?.credits_balance ?? 0)
