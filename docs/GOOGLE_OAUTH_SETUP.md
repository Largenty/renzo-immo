# Configuration Google OAuth - Supabase

## Étape 1 : Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet (ou sélectionner un existant)
3. Nom du projet : "Renzo Immobilier" (ou votre choix)

## Étape 2 : Configurer l'écran de consentement OAuth

1. Dans le menu, aller à **APIs & Services** > **OAuth consent screen**
2. Choisir **External** (pour permettre à tous de se connecter)
3. Cliquer **CREATE**

### Remplir les informations :

**App information:**
- App name: `Renzo Immobilier`
- User support email: `votre@email.com`
- App logo: (optionnel pour le moment)

**App domain:**
- Application home page: `https://rbtosufegzicxvenwtpt.supabase.co`
- Application privacy policy: (optionnel pour dev)
- Application terms of service: (optionnel pour dev)

**Authorized domains:**
- `supabase.co`

**Developer contact information:**
- Email: `votre@email.com`

4. Cliquer **SAVE AND CONTINUE**
5. **Scopes** : Cliquer **ADD OR REMOVE SCOPES**
   - Sélectionner `.../auth/userinfo.email`
   - Sélectionner `.../auth/userinfo.profile`
   - Cliquer **UPDATE**
6. Cliquer **SAVE AND CONTINUE**
7. **Test users** : Ajouter votre email pour tester
8. Cliquer **SAVE AND CONTINUE**

## Étape 3 : Créer les credentials OAuth

1. Aller à **APIs & Services** > **Credentials**
2. Cliquer **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Renzo Immobilier Web Client`

### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:3003
https://rbtosufegzicxvenwtpt.supabase.co
```

### Authorized redirect URIs:
```
http://localhost:3000/auth/callback
http://localhost:3003/auth/callback
https://rbtosufegzicxvenwtpt.supabase.co/auth/v1/callback
```

5. Cliquer **CREATE**
6. **COPIER** le **Client ID** et le **Client Secret** (vous en aurez besoin !)

## Étape 4 : Configurer dans Supabase Dashboard

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/rbtosufegzicxvenwtpt)
2. Aller dans **Authentication** > **Providers**
3. Trouver **Google** dans la liste
4. Activer **Enable Sign in with Google**

### Remplir :
- **Client ID (for OAuth)**: Coller le Client ID de Google
- **Client Secret (for OAuth)**: Coller le Client Secret de Google
- **Authorized Client IDs**: (laisser vide pour le moment)

5. Cliquer **Save**

## Étape 5 : Tester

1. Aller sur http://localhost:3003/auth/login
2. Cliquer sur "Continuer avec Google"
3. Sélectionner votre compte Google
4. Accepter les permissions
5. Vous devriez être redirigé vers `/dashboard` !

## Vérification

Après connexion Google, vérifiez dans Supabase Dashboard :
- **Authentication** > **Users** : Vous devriez voir votre user
- **Table Editor** > **users** : Une ligne doit être créée avec vos infos

## Troubleshooting

### Erreur: "redirect_uri_mismatch"
➡️ Vérifiez que l'URL de callback dans Google Cloud Console correspond exactement à :
```
https://rbtosufegzicxvenwtpt.supabase.co/auth/v1/callback
```

### Erreur: "Access blocked: This app's request is invalid"
➡️ Vérifiez que l'écran de consentement OAuth est bien configuré

### L'utilisateur n'est pas créé dans la table `users`
➡️ Vérifiez les logs dans Supabase Dashboard > **Logs** > **Postgres Logs**
➡️ Vérifiez que la `SUPABASE_SERVICE_ROLE_KEY` est bien dans votre `.env`

## Mode Production

Quand vous serez prêt pour la production :

1. **Google Cloud Console** :
   - Passer l'OAuth consent screen en **Production**
   - Ajouter les domaines de production dans "Authorized redirect URIs"

2. **Supabase** :
   - Aucun changement nécessaire, ça fonctionne automatiquement !

---

**Note :** L'authentification email/password fonctionne déjà sans configuration supplémentaire !
