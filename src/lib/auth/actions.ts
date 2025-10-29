/**
 * Auth Actions - Server Actions pour l'authentification
 * Utilise Supabase Auth + synchronisation avec notre table users
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export type AuthResult = {
  success: boolean
  message?: string
  error?: string
}

/**
 * Inscription avec email/password
 */
export async function signUp(formData: {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
}): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Erreur lors de la création du compte' }
    }

    // 2. Créer l'entrée dans notre table users (via service_role pour bypass RLS)
    const adminClient = createAdminClient()

    const { error: userError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        email_verified: false,
        password_hash: 'managed_by_supabase_auth', // Supabase Auth gère les passwords
      })

    if (userError) {
      console.error('Error creating user record:', userError)
      // Continuer quand même, l'auth est créée
    }

    return {
      success: true,
      message: 'Compte créé ! Vérifiez votre email pour confirmer votre adresse.',
    }
  } catch (error: any) {
    console.error('SignUp error:', error)
    return { success: false, error: error.message || 'Erreur lors de l\'inscription' }
  }
}

/**
 * Connexion avec email/password
 */
export async function signIn(formData: {
  email: string
  password: string
}): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Erreur lors de la connexion' }
    }

    // Mettre à jour last_login_at
    const adminClient = createAdminClient()
    await adminClient
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    return { success: true }
  } catch (error: any) {
    console.error('SignIn error:', error)
    return { success: false, error: error.message || 'Erreur lors de la connexion' }
  }
}

/**
 * Connexion avec Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.url) {
      redirect(data.url)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Google SignIn error:', error)
    return { success: false, error: error.message || 'Erreur lors de la connexion Google' }
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    redirect('/auth/login')
  } catch (error: any) {
    console.error('SignOut error:', error)
    return { success: false, error: error.message || 'Erreur lors de la déconnexion' }
  }
}

/**
 * Réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.',
    }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return { success: false, error: error.message || 'Erreur lors de la réinitialisation' }
  }
}

/**
 * Récupérer l'utilisateur courant
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Récupérer les données complètes depuis notre table users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return userData
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
