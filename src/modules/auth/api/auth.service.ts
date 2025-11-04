/**
 * Adapter : Auth Provider Supabase
 * Implémentation concrète du port IAuthProvider avec Supabase Auth
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IAuthProvider } from '@/domain/auth/ports/auth-provider'
import type { User, Session, SignUpInput, SignInInput, UpdateUserInput } from '@/domain/auth/models/user'

/**
 * Mapper : Supabase User → Domain User
 */
function mapSupabaseUserToDomain(supabaseUser: any, userData: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    avatarUrl: userData?.avatar_url,
    company: userData?.company,
    role: userData?.role as 'user' | 'admin' | undefined,
    emailVerified: supabaseUser.confirmed_at !== null,
    creditsBalance: userData?.credits_remaining || 0,
    subscriptionPlanId: userData?.subscription_plan_id,
    lastLoginAt: userData?.last_login_at ? new Date(userData.last_login_at) : undefined,
    createdAt: new Date(userData?.created_at || supabaseUser.created_at),
    updatedAt: new Date(userData?.updated_at || supabaseUser.updated_at),
    displayName: userData?.display_name,
  }
}

/**
 * Mapper : Supabase Session → Domain Session
 */
function mapSupabaseSessionToDomain(supabaseSession: any, user: User): Session {
  return {
    accessToken: supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    expiresAt: supabaseSession.expires_at || 0,
    user,
  }
}

export class SupabaseAuthProvider implements IAuthProvider {
  constructor(
    private readonly supabase: SupabaseClient
  ) {}

  async signUp(input: SignUpInput): Promise<User> {
    // ✅ VALIDATION MOT DE PASSE: Vérifier la force du mot de passe AVANT de créer le compte
    const { validatePassword } = await import('@/lib/validators/password-validator')
    const passwordValidation = validatePassword(input.password)

    if (!passwordValidation.valid) {
      throw new Error(
        `Mot de passe trop faible:\n${passwordValidation.errors.join('\n')}`
      )
    }

    // 1. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          company: input.company,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Erreur lors de la création du compte')
    }

    // 2. Le trigger Postgres 'on_auth_user_created' crée automatiquement l'utilisateur
    // dans public.users après l'INSERT dans auth.users
    // Attendre un peu que le trigger s'exécute
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. Récupérer les données utilisateur (créées automatiquement par le trigger)
    const { data: userData } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return mapSupabaseUserToDomain(authData.user, userData)
  }

  async signIn(input: SignInInput): Promise<{ user: User; session: Session }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user || !data.session) {
      throw new Error('Erreur lors de la connexion')
    }

    // Récupérer les données utilisateur complètes
    const { data: userData } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const user = mapSupabaseUserToDomain(data.user, userData)
    const session = mapSupabaseSessionToDomain(data.session, user)

    return { user, session }
  }

  async signInWithGoogle(): Promise<{ url: string }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.url) {
      throw new Error('URL de redirection OAuth non disponible')
    }

    return { url: data.url }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Récupérer les données complètes
    const { data: userData } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return null
    }

    return mapSupabaseUserToDomain(user, userData)
  }

  async getSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()

    if (!session) {
      return null
    }

    const user = await this.getCurrentUser()

    if (!user) {
      return null
    }

    return mapSupabaseSessionToDomain(session, user)
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    // Mettre à jour dans la table users
    const { data: userData, error } = await this.supabase
      .from('users')
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        avatar_url: input.avatarUrl,
        company: input.company,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    // Récupérer l'utilisateur Supabase Auth pour le mapper
    const {
      data: { user: authUser },
    } = await this.supabase.auth.getUser()

    if (!authUser) {
      throw new Error('User not found')
    }

    return mapSupabaseUserToDomain(authUser, userData)
  }
}
