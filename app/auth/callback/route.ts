/**
 * Auth Callback Route
 * Gère le callback OAuth (Google) et la vérification d'email
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    if (data.user) {
      // Vérifier si l'utilisateur existe dans notre table users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Si c'est un nouveau user (OAuth Google ou première connexion après signup), créer l'entrée
      if (!existingUser) {
        const adminClient = createAdminClient()

        const names = (data.user.user_metadata?.full_name || '').split(' ')
        const firstName = names[0] || data.user.user_metadata?.given_name || data.user.user_metadata?.first_name || 'User'
        const lastName = names.slice(1).join(' ') || data.user.user_metadata?.family_name || data.user.user_metadata?.last_name || ''

        await adminClient.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: firstName,
          last_name: lastName,
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          email_verified: data.user.email_confirmed_at ? true : false,
          password_hash: data.user.app_metadata?.provider === 'google' ? 'oauth_google' : 'managed_by_supabase_auth',
        })
      } else {
        // Si l'utilisateur existe, mettre à jour email_verified si nécessaire
        const adminClient = createAdminClient()
        await adminClient
          .from('users')
          .update({
            email_verified: data.user.email_confirmed_at ? true : false,
            last_login_at: new Date().toISOString()
          })
          .eq('id', data.user.id)
      }

      // Si pas de user existant, c'est que le last_login_at n'a pas été mis à jour ci-dessus
      if (!existingUser) {
        const adminClient = createAdminClient()
        await adminClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id)
      }
    }

    // Rediriger vers la page demandée ou le dashboard par défaut
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Erreur : pas de code
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
