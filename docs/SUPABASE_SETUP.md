# Guide de Setup Supabase - Renzo Immobilier

## Étape 1 : Accéder au Dashboard Supabase

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet : `rbtosufegzicxvenwtpt`
3. Vérifier que l'URL est bien : `https://rbtosufegzicxvenwtpt.supabase.co`

---

## Étape 2 : Récupérer la Service Role Key

1. Dans le dashboard Supabase, aller dans **Settings** (⚙️) > **API**
2. Copier la **service_role key** (section "Project API keys")
3. Ajouter dans votre fichier `.env` :
   ```
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
   ```

⚠️ **ATTENTION**: Ne JAMAIS exposer cette clé côté client !

---

## Étape 3 : Appliquer les migrations SQL

### Option A : Via le SQL Editor (Recommandé pour démarrer)

1. Dans le dashboard Supabase, aller dans **SQL Editor** (icône `</>`)

2. **Migration 001 - Schema Initial**
   - Cliquer sur "New query"
   - Copier tout le contenu de `supabase/migrations/001_initial_schema.sql`
   - Coller dans l'éditeur
   - Cliquer sur "Run" (ou `Ctrl+Enter`)
   - ✅ Vérifier qu'il n'y a pas d'erreurs

3. **Migration 002 - RLS Policies**
   - Nouvelle query
   - Copier `supabase/migrations/002_rls_policies.sql`
   - Run
   - ✅ Vérifier

4. **Migration 003 - Storage Buckets**
   - Nouvelle query
   - Copier `supabase/migrations/003_storage_buckets.sql`
   - Run
   - ✅ Vérifier

### Option B : Via Supabase CLI (Avancé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier le projet
supabase link --project-ref rbtosufegzicxvenwtpt

# Appliquer les migrations
supabase db push
```

---

## Étape 4 : Vérifier que tout fonctionne

### Vérifier les tables

1. Aller dans **Table Editor**
2. Vérifier que vous voyez ces tables :
   - ✅ users
   - ✅ subscription_plans
   - ✅ subscriptions
   - ✅ payment_methods
   - ✅ invoices
   - ✅ credit_packs
   - ✅ credit_transactions
   - ✅ projects
   - ✅ transformation_types
   - ✅ images
   - ✅ user_notifications_preferences
   - ✅ contact_submissions
   - ✅ sessions
   - ✅ audit_logs
   - ✅ stripe_events

3. Vérifier les données initiales :
   - `subscription_plans` doit contenir 3 plans (Starter, Pro, Agence)
   - `credit_packs` doit contenir 4 packs
   - `transformation_types` doit contenir 8 styles système

### Vérifier les Storage Buckets

1. Aller dans **Storage**
2. Vérifier que vous voyez ces buckets :
   - ✅ images (privé)
   - ✅ avatars (public)
   - ✅ styles (privé)

### Vérifier les RLS Policies

1. Aller dans **Authentication** > **Policies**
2. Vérifier que chaque table a ses policies activées

---

## Étape 5 : Configurer l'authentification

### Email Auth (Par défaut)

1. Aller dans **Authentication** > **Providers**
2. **Email** doit être activé par défaut
3. Configurer les templates d'emails :
   - Aller dans **Email Templates**
   - Personnaliser "Confirm signup", "Reset password", etc.

### Activer les confirmations d'email (Optionnel pour MVP)

1. Dans **Authentication** > **Providers** > **Email**
2. Décocher "Confirm email" si vous voulez permettre l'inscription sans vérification (MVP)
3. Ou laisser coché pour plus de sécurité

### Google OAuth (Optionnel)

1. Aller dans **Authentication** > **Providers**
2. Activer **Google**
3. Configurer avec vos credentials Google OAuth
   - [Guide Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## Étape 6 : Tester la connexion depuis Next.js

### Créer un test rapide

Créer le fichier `app/test-supabase/page.tsx` :

```tsx
'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function TestSupabase() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')

        if (error) throw error
        setPlans(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="text-green-600 mb-4">✅ Connected to Supabase!</p>

      <h2 className="text-xl font-semibold mb-2">Subscription Plans:</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(plans, null, 2)}
      </pre>
    </div>
  )
}
```

### Tester

1. Ouvrir [http://localhost:3000/test-supabase](http://localhost:3000/test-supabase)
2. Vous devriez voir les 3 plans d'abonnement
3. Si ça fonctionne : ✅ **Supabase est prêt !**

---

## Étape 7 : Configuration de sécurité (Production)

### Activer les restrictions

1. **Settings** > **API** > **API Settings**
2. Configurer les **JWT Settings** :
   - JWT expiry : 3600 (1 heure)
   - Refresh token expiry : 604800 (7 jours)

3. **Activer les rate limits** (Projet Pro) :
   - Limite les requêtes par IP
   - Protection contre les attaques

### Configurer les CORS

1. **Settings** > **API** > **CORS**
2. Ajouter vos domaines autorisés :
   - `http://localhost:3000` (dev)
   - `https://votre-domaine.com` (production)

---

## Étape 8 : Backup et monitoring

### Activer les backups automatiques

1. **Settings** > **Database** > **Backups**
2. Les backups quotidiens sont activés sur le plan Pro
3. Rétention : 7 jours (gratuit) ou plus (payant)

### Monitoring

1. **Reports** dans le dashboard
   - API requests
   - Database size
   - Storage usage

---

## Commandes utiles

### Vérifier la connexion

```bash
# Test de connexion
curl https://rbtosufegzicxvenwtpt.supabase.co/rest/v1/ \
  -H "apikey: VOTRE_ANON_KEY"
```

### Lister les tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Vérifier les RLS policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### Vérifier les buckets

```sql
SELECT * FROM storage.buckets;
```

---

## Dépannage

### Erreur : "relation does not exist"

➡️ Les migrations n'ont pas été appliquées correctement
- Vérifier dans SQL Editor que les tables existent
- Réappliquer les migrations

### Erreur : "JWT expired"

➡️ Token expiré
- Rafraîchir la session utilisateur
- Vérifier `supabase.auth.refreshSession()`

### Erreur : "new row violates row-level security policy"

➡️ Problème de RLS policy
- Vérifier que l'utilisateur est authentifié
- Vérifier les policies dans **Authentication** > **Policies**

### Erreur Storage : "Access denied"

➡️ Problème de policy Storage
- Vérifier les policies dans **Storage** > **Policies**
- Vérifier que le path respecte le format `{user_id}/...`

---

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## Prochaines étapes

Une fois Supabase configuré :

1. ✅ Implémenter l'authentification dans les pages `/auth/login` et `/auth/signup`
2. ✅ Connecter les pages dashboard aux vraies données
3. ✅ Implémenter l'upload d'images
4. ✅ Configurer Stripe
5. ✅ Setup workers pour traitement IA

---

**Dernière mise à jour :** 23 octobre 2025
