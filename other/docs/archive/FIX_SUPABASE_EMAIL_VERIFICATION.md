# Fix Supabase Email Verification

## Problème
Les emails de confirmation ne sont pas envoyés lors de l'inscription.

## Causes Possibles

### 1. Rate Limiting Supabase
Supabase limite l'envoi d'emails en développement (1 email par heure par utilisateur).

### 2. Configuration Auth Supabase
Les paramètres d'authentification doivent être correctement configurés.

### 3. URL de Redirection Non Autorisée
L'URL `emailRedirectTo` doit être dans la liste des URLs autorisées.

---

## Solutions

### ✅ Solution 1: Vérifier la Configuration Auth (RECOMMANDÉ)

1. **Aller sur Supabase Dashboard**: https://supabase.com/dashboard
2. **Sélectionner votre projet**
3. **Aller dans Authentication > Providers > Email**
4. **Vérifier ces paramètres:**
   - ✅ **Enable Email provider** doit être activé
   - ✅ **Confirm email** doit être activé
   - ✅ **Secure email change** (optionnel)

5. **Aller dans Authentication > URL Configuration**
6. **Ajouter vos URLs de redirection:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   http://localhost:3002/auth/callback
   http://localhost:3003/auth/callback
   ```
   Et votre URL de production si applicable.

7. **Vérifier Site URL:**
   ```
   http://localhost:3000
   ```
   (Ou votre URL de production)

### ✅ Solution 2: Configurer SMTP (Pour Production)

**Important:** En production, configurez un service SMTP professionnel.

1. **Aller dans Project Settings > Auth > SMTP Settings**
2. **Choisir un provider:**
   - **SendGrid** (Recommandé - 100 emails/jour gratuits)
   - **Resend** (100 emails/jour gratuits)
   - **Amazon SES** (62,000 emails/mois gratuits)

3. **Configuration SendGrid (Exemple):**
   ```
   Sender email: noreply@votredomaine.com
   Sender name: Renzo Immobilier
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Votre API Key SendGrid]
   ```

4. **Sauvegarder et tester**

### ✅ Solution 3: Vérification Manuelle (Développement)

**Pour continuer à développer sans attendre l'email:**

#### A. Via Supabase Dashboard (Plus Simple)
1. Aller dans **Authentication > Users**
2. Trouver votre utilisateur
3. Cliquer sur les 3 points (...)
4. Cliquer sur **Verify email** ou **Confirm email**
5. ✅ Email maintenant vérifié !

#### B. Via SQL (Plus Rapide)
Utiliser le script: `scripts/verify-email-manually.sql`

```sql
-- Voir les utilisateurs non vérifiés
SELECT id, email, confirmed_at, email_confirmed_at
FROM auth.users
WHERE confirmed_at IS NULL
ORDER BY created_at DESC;

-- Vérifier l'email d'un utilisateur spécifique
UPDATE auth.users
SET confirmed_at = NOW(), email_confirmed_at = NOW()
WHERE email = 'votre-email@example.com';
```

### ✅ Solution 4: Vérifier les Logs Supabase

1. **Aller dans Logs > Auth Logs**
2. **Filtrer par "signup" ou "email"**
3. **Chercher les erreurs:**
   - Rate limit exceeded
   - SMTP configuration error
   - Invalid redirect URL
   - Template rendering error

### ✅ Solution 5: Désactiver Temporairement (Dev Only)

**⚠️ À UTILISER UNIQUEMENT EN DÉVELOPPEMENT ⚠️**

Pour bypasser la vérification d'email en développement:

#### Étape 1: Commenter dans middleware.ts
```typescript
// src/lib/supabase/middleware.ts

// ✅ EMAIL VERIFICATION: Temporairement désactivé pour dev
if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
  // if (!user.confirmed_at) {
  //   const redirectUrl = request.nextUrl.clone()
  //   redirectUrl.pathname = '/auth/verify-email'
  //   return NextResponse.redirect(redirectUrl)
  // }
}
```

#### Étape 2: Commenter dans les API routes
```typescript
// app/api/generate-image/route.ts
// app/api/check-generation-status/route.ts

// if (!user.confirmed_at) {
//   return NextResponse.json(...)
// }
```

⚠️ **NE PAS OUBLIER DE RÉACTIVER EN PRODUCTION !**

---

## Checklist de Vérification

- [ ] Enable Email provider activé dans Supabase
- [ ] Confirm email activé
- [ ] URLs de redirection ajoutées (localhost:3000-3003/auth/callback)
- [ ] Site URL configurée
- [ ] SMTP configuré (pour production)
- [ ] Vérifier les logs Auth pour les erreurs
- [ ] Tester l'inscription avec un nouvel email
- [ ] Vérifier les spams/courrier indésirable

---

## Test de l'Email

### Test avec Supabase (Gratuit)
1. **Authentication > Email Templates**
2. **Sélectionner "Confirm signup"**
3. **Cliquer sur "Send test email"**
4. **Vérifier votre boîte mail**

Si le test fonctionne mais pas l'inscription:
- Vérifier les URLs de redirection
- Vérifier les logs d'authentification
- Vérifier le rate limiting

---

## Environnement de Production

Pour la production, suivez ces étapes:

1. **Configurer un SMTP professionnel** (SendGrid/Resend/SES)
2. **Ajouter votre domaine de production** dans URL Configuration
3. **Personnaliser les templates d'emails** (Authentication > Email Templates)
4. **Ajouter votre logo** et design personnalisé
5. **Tester en staging** avant le déploiement

---

## Support

Si le problème persiste:
1. Vérifier les logs Supabase (Logs > Auth Logs)
2. Consulter la documentation: https://supabase.com/docs/guides/auth/auth-email
3. Contacter le support Supabase: https://supabase.com/support
