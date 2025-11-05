# Bypass Email Verification (Dev uniquement)

## Méthode 1 : Via Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Authentication** > **Users**
4. Trouver votre utilisateur
5. Cliquer sur les 3 points (...) à droite
6. Cliquer sur **Verify email** ou **Confirm email**
7. ✅ Email maintenant vérifié !

## Méthode 2 : Via SQL (Plus rapide)

Dans Supabase SQL Editor :

```sql
-- Vérifier manuellement l'email d'un utilisateur
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'votre-email@example.com';
```

## Méthode 3 : Désactiver temporairement la vérification (Dev seulement)

### Étape 1 : Commenter la vérification dans le middleware

Fichier: `src/lib/supabase/middleware.ts`

```typescript
// ✅ EMAIL VERIFICATION: Vérifier que l'email est confirmé
if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
  // ⚠️ TEMPORAIREMENT DÉSACTIVÉ POUR DEV
  // if (!user.email_confirmed_at) {
  //   const redirectUrl = request.nextUrl.clone()
  //   redirectUrl.pathname = '/auth/verify-email'
  //   return NextResponse.redirect(redirectUrl)
  // }
}
```

### Étape 2 : Commenter dans les API routes

Fichier: `app/api/generate-image/route.ts` et `app/api/check-generation-status/route.ts`

```typescript
// ✅ EMAIL VERIFICATION: Vérifier que l'email est confirmé
// ⚠️ TEMPORAIREMENT DÉSACTIVÉ POUR DEV
// if (!user.email_confirmed_at) {
//   return NextResponse.json(...)
// }
```

⚠️ **IMPORTANT**: Ne pas oublier de réactiver en production !

## Méthode 4 : Configurer Email Templates Supabase

1. Aller dans **Authentication** > **Email Templates**
2. Vérifier que le template "Confirm signup" est activé
3. Personnaliser si besoin
4. Tester avec "Send test email"

## Méthode 5 : Vérifier SMTP Settings

1. Aller dans **Project Settings** > **Auth**
2. Section "SMTP Settings"
3. Vérifier que c'est configuré ou utiliser le SMTP Supabase par défaut

## Méthode 6 : Resend depuis l'app

1. Aller sur `/auth/verify-email`
2. Cliquer sur "Renvoyer l'email"
3. Attendre 60 secondes de cooldown
4. Vérifier votre boîte mail (et spams)

---

**Pour le développement, je recommande la Méthode 1 ou 2 (vérification manuelle via Supabase).**
