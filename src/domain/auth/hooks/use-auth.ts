/**
 * React Hooks pour le domaine Auth
 * Expose les services du domaine via React Query
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SupabaseAuthProvider } from '@/infra/adapters/auth-provider.supabase'
import { SupabaseUsersRepository } from '@/infra/adapters/users-repository.supabase'
import { AuthenticateService } from '../services/authenticate'
import { ManageUserService } from '../services/manage-user'
import type { SignUpInput, SignInInput, UpdateUserInput } from '../models/user'

/**
 * Hook : Récupérer l'utilisateur courant
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.getCurrentUser()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook : Récupérer la session courante
 */
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.getSession()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

/**
 * Hook : Inscription
 */
export function useSignUp() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.signUp(input)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Compte créé !', {
          description: result.message,
        })
        router.push('/auth/login?verified=pending')
      } else {
        toast.error('Erreur', {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'inscription', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Connexion
 */
export function useSignIn() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.signIn(input)
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['current-user'] })
        queryClient.invalidateQueries({ queryKey: ['session'] })

        toast.success('Connexion réussie !')
        router.push('/dashboard')
      } else {
        toast.error('Erreur', {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de la connexion', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Déconnexion
 */
export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.signOut()
    },
    onSuccess: () => {
      // Nettoyer tous les caches
      queryClient.clear()

      toast.success('Déconnexion réussie')
      router.push('/auth/login')
    },
    onError: (error) => {
      toast.error('Erreur lors de la déconnexion', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Réinitialisation de mot de passe
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient()
      const authProvider = new SupabaseAuthProvider(supabase)
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new AuthenticateService(authProvider, usersRepository)

      return service.resetPassword(email)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Email envoyé !', {
          description: result.message,
        })
      } else {
        toast.error('Erreur', {
          description: result.error,
        })
      }
    },
    onError: (error) => {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Mettre à jour le profil utilisateur
 */
export function useUpdateUser(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const usersRepository = new SupabaseUsersRepository(supabase)
      const service = new ManageUserService(usersRepository)

      return service.updateUser(userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] })

      toast.success('Profil mis à jour')
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}
