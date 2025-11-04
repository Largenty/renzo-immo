# Modules - Architecture Simplifiée

## 🎯 Concept

Chaque **module** regroupe **TOUT** ce qui concerne une fonctionnalité au même endroit :
- Types & interfaces
- Hooks React Query
- Composants UI
- Services API
- Utilitaires

**Fini la fragmentation** entre `domain/`, `application/`, `infrastructure/`, `presentation/` !

## 📁 Structure d'un Module

```
modules/
└── auth/                    # Module d'authentification
    ├── types.ts            # Types, interfaces, schemas Zod
    ├── index.ts            # Exports publics du module
    │
    ├── hooks/              # Hooks React Query
    │   └── use-auth.ts    # useLogin, useSignup, useCurrentUser, etc.
    │
    ├── api/                # Services & repositories
    │   └── auth.service.ts # SupabaseAuthAdapter
    │
    ├── components/         # Composants React
    │   ├── LoginForm.tsx
    │   ├── SignupForm.tsx
    │   ├── PasswordInput.tsx
    │   └── ...
    │
    └── utils/              # Utilitaires spécifiques (optionnel)
        └── validate-password.ts
```

## ✅ Exemple Complet : Module Auth

### 1. Types (`auth/types.ts`)

Tout au même endroit : interfaces, types, schemas Zod

```typescript
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  // ...
}

export interface IAuthProvider {
  signIn(data: SignInInput): Promise<Session>
  signUp(data: SignUpInput): Promise<User>
  // ...
}

export const signInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

### 2. Hooks (`auth/hooks/use-auth.ts`)

React Query hooks pour le state management

```typescript
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // Logic here
    },
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: SignInInput) => {
      // Logic here
    },
  })
}
```

### 3. API (`auth/api/auth.service.ts`)

Service qui communique avec Supabase/API externe

```typescript
export class SupabaseAuthAdapter implements IAuthProvider {
  async signIn(data: SignInInput): Promise<Session> {
    const { data: session, error } = await supabase.auth.signInWithPassword(data)
    if (error) throw new Error(error.message)
    return session
  }
}
```

### 4. Components (`auth/components/`)

Composants React (pas de hiérarchie atoms/molecules/organisms)

```typescript
// LoginForm.tsx
export function LoginForm() {
  const login = useLogin()

  return (
    <form onSubmit={...}>
      {/* UI */}
    </form>
  )
}
```

### 5. Index (`auth/index.ts`)

Exports publics du module

```typescript
// Types
export * from './types'

// Hooks
export * from './hooks/use-auth'

// Components
export { LoginForm } from './components/LoginForm'
export { SignupForm } from './components/SignupForm'

// API
export { SupabaseAuthAdapter } from './api/auth.service'
```

## 🚀 Utilisation

### Avant (architecture hexagonale)

```typescript
// 4 imports différents 😵
import { User } from '@/domain/auth/models/user'
import { useLogin } from '@/application/auth/use-auth'
import { SupabaseAuthAdapter } from '@/infrastructure/supabase/auth-provider'
import { LoginForm } from '@/presentation/features/auth/organisms/login-form'
```

### Après (modules)

```typescript
// 1 seul import 🎉
import { User, useLogin, SupabaseAuthAdapter, LoginForm } from '@/modules/auth'
```

## 📦 Modules Disponibles

### ✅ Migrés
- **auth** - Authentification & utilisateurs

### 🚧 À Migrer
- **credits** - Système de crédits & paiements
- **projects** - Gestion des projets
- **images** - Génération d'images IA
- **rooms** - Types de pièces
- **styles** - Styles de transformation

## 🔄 Migration Progressive

**Pas besoin de tout migrer d'un coup !**

Tu peux :
1. ✅ Utiliser les nouveaux modules (ex: `@/modules/auth`)
2. ⏳ Garder l'ancienne structure pour le reste
3. 🔄 Migrer au fur et à mesure

Les deux structures peuvent coexister temporairement.

## 🎯 Quand Migrer un Module ?

Migre un module quand :
- Tu travailles activement dessus
- Tu veux simplifier son organisation
- Tu as besoin de le refactorer

**Pas d'urgence !** C'est du refactoring progressif.

## 📝 Template pour Nouveau Module

```bash
# Créer un nouveau module
mkdir -p src/modules/feature/{components,hooks,api,utils}

# Créer fichiers de base
touch src/modules/feature/{types.ts,index.ts}
touch src/modules/feature/hooks/use-feature.ts
touch src/modules/feature/api/feature.service.ts
```

## 🤔 Shared vs Module

### Module (`modules/auth/`)
Spécifique à UNE fonctionnalité (auth, credits, etc.)

### Shared (`shared/`)
Réutilisable PARTOUT (Button, Input, utils communs)

## ✨ Avantages

- ✅ **Navigation simple** - Tout au même endroit
- ✅ **Moins de dossiers** - Fini la fragmentation
- ✅ **Imports courts** - Un seul import par module
- ✅ **Scalable** - Ajouter un module = créer un dossier
- ✅ **Testable** - Tests à côté du code (__tests__)
- ✅ **Clair** - Structure intuitive

---

**Architecture par modules = Pragmatique & Simple** 🚀
