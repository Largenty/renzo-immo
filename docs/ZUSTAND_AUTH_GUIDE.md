# Guide d'utilisation du Store Zustand pour l'Authentification

## Vue d'ensemble

Ce projet utilise **Zustand** pour gérer l'état global de l'authentification côté client. Le store synchronise automatiquement les sessions Supabase avec l'état React, offrant une expérience utilisateur fluide.

## Architecture

```
src/lib/stores/auth-store.ts          → Store Zustand avec persistance
src/components/providers/auth-provider.tsx → Provider pour synchroniser Supabase
app/layout.tsx                         → Integration du AuthProvider
```

## Installation

```bash
npm install zustand
```

## Fichiers créés

### 1. Store Zustand (`src/lib/stores/auth-store.ts`)

Le store contient :
- **État** : `user`, `session`, `isLoading`, `isInitialized`
- **Actions** : `setUser`, `setSession`, `updateUser`, `updateCredits`, `reset`
- **Persistance** : Sauvegarde automatique dans `localStorage`

### 2. Auth Provider (`src/components/providers/auth-provider.tsx`)

Le provider :
- Synchronise la session Supabase au montage
- Écoute les changements d'authentification (`onAuthStateChange`)
- Met à jour automatiquement le store
- Gère les events : `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`

## Utilisation

### Dans les composants

```tsx
import { useUser, useSession, useIsAuthenticated, useCreditsBalance } from '@/lib/stores/auth-store'

function MyComponent() {
  const user = useUser()                    // Données utilisateur complètes
  const session = useSession()              // Session Supabase
  const isAuthenticated = useIsAuthenticated() // true si connecté
  const credits = useCreditsBalance()       // Solde de crédits

  return (
    <div>
      {isAuthenticated ? (
        <p>Bonjour {user?.first_name} ! Vous avez {credits} crédits.</p>
      ) : (
        <p>Non connecté</p>
      )}
    </div>
  )
}
```

### Accès direct au store

```tsx
import { useAuthStore } from '@/lib/stores/auth-store'

function MyComponent() {
  const { user, updateUser, updateCredits } = useAuthStore()

  // Mettre à jour partiellement l'utilisateur
  const handleUpdateProfile = () => {
    updateUser({ first_name: 'Nouveau nom' })
  }

  // Ajouter/retirer des crédits
  const handleAddCredits = () => {
    updateCredits(10) // +10 crédits
  }

  const handleRemoveCredits = () => {
    updateCredits(-5) // -5 crédits
  }

  return <div>...</div>
}
```

### Réinitialiser le store (déconnexion)

```tsx
import { useAuthStore } from '@/lib/stores/auth-store'

function LogoutButton() {
  const reset = useAuthStore((state) => state.reset)

  const handleLogout = () => {
    // La fonction signOut() dans auth/actions.ts
    // appelle déjà supabase.auth.signOut()
    // qui déclenche l'event SIGNED_OUT
    // et reset() est appelé automatiquement par le provider
  }

  return <button onClick={handleLogout}>Se déconnecter</button>
}
```

## Synchronisation automatique

Le store se synchronise automatiquement dans les cas suivants :

1. **Au chargement de l'app** : Récupère la session depuis Supabase
2. **À la connexion** : Event `SIGNED_IN` → Charge les données utilisateur
3. **À la déconnexion** : Event `SIGNED_OUT` → Reset du store
4. **Refresh token** : Event `TOKEN_REFRESHED` → Met à jour la session
5. **Modification user** : Event `USER_UPDATED` → Recharge les données

## Persistance

Le store persiste automatiquement dans `localStorage` sous la clé `renzo-auth-storage`.

**Données persistées :**
- `user` : Données utilisateur complètes
- `session` : Session Supabase (tokens)

**Données non persistées :**
- `isLoading` : État de chargement
- `isInitialized` : État d'initialisation

## Sélecteurs utiles

```tsx
// Hooks pré-configurés
import {
  useUser,           // Données utilisateur
  useSession,        // Session Supabase
  useIsAuthenticated, // Boolean connecté/non connecté
  useCreditsBalance  // Solde de crédits uniquement
} from '@/lib/stores/auth-store'
```

## Exemples d'utilisation

### Navbar avec menu utilisateur

```tsx
// src/components/layout/navbar.tsx
import { useUser, useIsAuthenticated } from '@/lib/stores/auth-store'

export function Navbar() {
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          <span>Bonjour {user?.first_name}</span>
          <button>Se déconnecter</button>
        </div>
      ) : (
        <a href="/auth/login">Se connecter</a>
      )}
    </nav>
  )
}
```

### Dashboard avec affichage des crédits

```tsx
// app/dashboard/layout.tsx
import { useUser, useCreditsBalance } from '@/lib/stores/auth-store'

export default function DashboardLayout() {
  const user = useUser()
  const credits = useCreditsBalance()

  return (
    <div>
      <header>
        <div>
          <img src={user?.avatar_url} alt={user?.first_name} />
          <span>{user?.first_name} {user?.last_name}</span>
        </div>
        <div>Crédits: {credits}</div>
      </header>
    </div>
  )
}
```

### Mise à jour des crédits après achat

```tsx
import { useAuthStore } from '@/lib/stores/auth-store'

function BuyCreditsButton() {
  const updateCredits = useAuthStore((state) => state.updateCredits)

  const handleBuy = async () => {
    // Après paiement réussi
    const creditsBought = 100
    updateCredits(creditsBought) // +100 crédits

    // Ou recharger depuis la DB pour être sûr
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('credits_balance')
      .single()

    if (data) {
      useAuthStore.getState().updateUser({ credits_balance: data.credits_balance })
    }
  }

  return <button onClick={handleBuy}>Acheter 100 crédits</button>
}
```

## Debugging

Pour inspecter le store en temps réel :

```tsx
// Dans n'importe quel composant
import { useAuthStore } from '@/lib/stores/auth-store'

useEffect(() => {
  console.log('Store state:', useAuthStore.getState())
}, [])

// Ou dans la console Chrome
window.authStore = useAuthStore
```

Dans la console :
```javascript
authStore.getState()        // Voir l'état actuel
authStore.getState().user   // Voir l'utilisateur
authStore.getState().reset() // Reset manuel
```

## Migration depuis getCurrentUser()

**Avant (Server Action)** :
```tsx
import { getCurrentUser } from '@/lib/auth/actions'

async function MyComponent() {
  const user = await getCurrentUser()

  return <div>{user?.first_name}</div>
}
```

**Après (Zustand)** :
```tsx
'use client'
import { useUser } from '@/lib/stores/auth-store'

function MyComponent() {
  const user = useUser()

  return <div>{user?.first_name}</div>
}
```

## Avantages de Zustand

✅ **Performance** : Pas de re-render inutiles
✅ **Persistance** : Données sauvegardées dans localStorage
✅ **Synchronisation** : Auto-sync avec Supabase
✅ **TypeScript** : Full typesafety
✅ **Simplicité** : API simple et intuitive
✅ **DevTools** : Support des Redux DevTools

## Bonnes pratiques

1. **Utiliser les sélecteurs** pour éviter les re-renders inutiles
   ```tsx
   // ❌ Mauvais - re-render à chaque changement du store
   const { user, session, isLoading } = useAuthStore()

   // ✅ Bon - re-render uniquement si user change
   const user = useUser()
   ```

2. **Ne pas persister de données sensibles**
   - Le store persiste dans localStorage
   - Les tokens sont OK (déjà exposés côté client par Supabase)
   - Ne jamais stocker de mots de passe ou clés API

3. **Synchroniser avec la DB après mutations importantes**
   ```tsx
   // Après un achat de crédits, vérifier en DB
   const { data } = await supabase.from('users').select('*').single()
   updateUser(data)
   ```

4. **Utiliser le provider dans le layout root**
   - Le `AuthProvider` doit wrapper toute l'app
   - Déjà configuré dans `app/layout.tsx`

## Troubleshooting

### Le store ne se met pas à jour

- Vérifier que `AuthProvider` est bien dans le layout
- Vérifier les logs de `onAuthStateChange` dans la console
- Vérifier que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis

### Données obsolètes après refresh

- Vérifier la persistance dans localStorage : `localStorage.getItem('renzo-auth-storage')`
- Clear le localStorage si nécessaire : `localStorage.clear()`

### TypeScript errors

- S'assurer que `UserData` interface est à jour dans `auth-store.ts`
- Correspond aux colonnes de la table `users` dans Supabase

## Ressources

- [Documentation Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Supabase Auth Events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
