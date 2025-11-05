# Refactoring: Architecture par Modules

## 🎯 Objectif

Simplifier l'architecture en regroupant tout ce qui concerne une fonctionnalité au même endroit, au lieu de fragmenter entre `domain/`, `application/`, `infrastructure/`, `presentation/`.

## ✅ Migration Complétée

### Structure Avant (Complexe)

```
src/
├── domain/
│   ├── auth/         # Models, ports, services
│   ├── credits/
│   └── ...
├── application/
│   ├── auth/         # React Query hooks
│   ├── credits/
│   └── ...
├── infrastructure/
│   ├── supabase/     # Adapters
│   ├── ai/
│   └── ...
└── presentation/
    └── features/
        ├── auth/
        │   ├── atoms/
        │   ├── molecules/
        │   └── organisms/
        └── ...
```

**Problème**: Pour modifier "auth", il fallait toucher 4 dossiers différents !

### Structure Après (Simple)

```
src/
├── modules/
│   ├── auth/
│   │   ├── types.ts           # Interfaces, types, schemas Zod
│   │   ├── index.ts           # Exports publics
│   │   ├── hooks/             # React Query hooks
│   │   │   └── use-auth.ts
│   │   ├── api/               # Services & repositories
│   │   │   └── auth.service.ts
│   │   ├── components/        # Tous les composants
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ...
│   │   └── utils/             # Utilitaires spécifiques
│   │       └── validate-password.ts
│   │
│   ├── credits/               # Même structure
│   ├── projects/
│   ├── images/
│   ├── rooms/
│   └── styles/
│
└── shared/                    # Réutilisable partout
    ├── components/            # UI components (shadcn/ui)
    ├── hooks/                 # Hooks communs
    └── utils/                 # Utilitaires communs
```

**Avantage**: Tout pour "auth" est dans `modules/auth/` !

## 📦 Modules Migrés

### ✅ auth
**Contenu**:
- `types.ts` - User, Session, IAuthProvider, schemas Zod
- `hooks/use-auth.ts` - useCurrentUser, useLogin, useSignup, etc.
- `api/auth.service.ts` - SupabaseAuthAdapter
- `components/` - LoginForm, SignupForm, PasswordInput, etc.
- `utils/validate-password.ts` - Validation force mot de passe

### ✅ credits
**Contenu**:
- `types.ts` - CreditPack, CreditTransaction, ICreditsRepository
- `hooks/use-credits.ts` - useCreditBalance, usePurchaseCredits
- `api/credits.repository.ts` - SupabaseCreditsRepository (ATOMIQUE)
- `components/` - CreditPackCard, CreditsOverviewCard, etc.
- `utils/credit-cost.ts` - Calcul coûts crédits

### ✅ projects
**Contenu**:
- `types.ts` - Project, IProjectsRepository, IProjectStorage
- `hooks/use-projects.ts` - useProjects, useCreateProject, etc.
- `api/` - projects-repository, project-storage
- `components/` - ProjectHeader, ProjectForm, ImageCard, etc.

### ✅ images
**Contenu**:
- `types.ts` - Image, IAIGenerator, GenerateImageInput
- `hooks/use-images.ts` - useGenerateImage, useProjectImages, polling
- `api/` - nanobanana.adapter, nanobanana-client.adapter
- `components/` - ImageUploader, FileDropZone, etc.

### ✅ rooms
**Contenu**:
- `types.ts` - Room, IRoomsRepository
- `hooks/use-rooms.ts` - useRooms, useCreateRoom

### ✅ styles
**Contenu**:
- `types.ts` - TransformationType, CustomStyle, IStylesRepository
- `hooks/use-styles.ts` - useAllTransformationTypes, useCustomStyles

## 🔧 shared/
**Contenu**:
- `components/` - UI components (Button, Card, Dialog, etc.)
- `hooks/` - use-toast, use-media-query
- `utils/` - cn() et utilitaires communs

## 🚀 Utilisation

### Avant

```typescript
// 4 imports différents 😵
import { User } from '@/domain/auth/models/user'
import { useLogin } from '@/application/auth/use-auth'
import { SupabaseAuthAdapter } from '@/infrastructure/supabase/auth-provider'
import { LoginForm } from '@/presentation/features/auth/organisms/login-form'
```

### Après

```typescript
// 1 seul import 🎉
import { User, useLogin, SupabaseAuthAdapter, LoginForm } from '@/modules/auth'

// Ou imports sélectifs
import { User, useLogin } from '@/modules/auth'
import { LoginForm } from '@/modules/auth'
```

### Shared Components

```typescript
// Avant
import { Button } from '@/presentation/shared/ui/button'
import { Dialog } from '@/presentation/shared/ui/dialog'

// Après
import { Button, Dialog } from '@/shared'
```

## 📊 Statistiques

- **Modules créés**: 6 (auth, credits, projects, images, rooms, styles)
- **Fichiers migrés**: ~68 fichiers
- **Dossiers supprimés** (à faire): domain/, application/, infrastructure/, presentation/

## 🔄 État de la Migration

### ✅ Fait
1. Création structure `modules/` et `shared/`
2. Migration de tous les fichiers vers nouveaux modules
3. Création des fichiers `index.ts` pour exports propres
4. Documentation (ce fichier + `modules/README.md`)

### 🚧 À Faire (Prochaines Étapes)
1. **Mettre à jour les imports** dans tout le projet
   - Remplacer `@/domain/auth` → `@/modules/auth`
   - Remplacer `@/application/credits` → `@/modules/credits`
   - Remplacer `@/presentation/shared/ui` → `@/shared`

2. **Supprimer anciens dossiers** (une fois imports mis à jour)
   - Supprimer `src/domain/`
   - Supprimer `src/application/`
   - Supprimer `src/infrastructure/`
   - Supprimer `src/presentation/`

3. **Vérifier le build**
   - Tester `npm run build`
   - Corriger erreurs TypeScript

4. **Mettre à jour la documentation**
   - ARCHITECTURE.md
   - FILE_INDEX.md
   - README principaux

## 🎓 Guide d'Import

### Modules

| Ancien | Nouveau |
|--------|---------|
| `@/domain/auth/models/user` | `@/modules/auth` |
| `@/application/auth/use-auth` | `@/modules/auth` |
| `@/infrastructure/supabase/auth-provider` | `@/modules/auth` |
| `@/presentation/features/auth/organisms/login-form` | `@/modules/auth` |

### Shared

| Ancien | Nouveau |
|--------|---------|
| `@/presentation/shared/ui/button` | `@/shared` |
| `@/presentation/shared/providers/query-provider` | `@/shared` |
| `@/hooks/use-toast` | `@/shared` |
| `@/lib/utils` | `@/shared` |

## 🧪 Test d'Import

Vérifier qu'un module fonctionne :

```typescript
// test-module.ts
import {
  // Types
  User,
  Session,
  SignInInput,

  // Hooks
  useCurrentUser,
  useLogin,
  useSignup,

  // Components
  LoginForm,
  SignupForm,

  // API
  SupabaseAuthAdapter,
} from '@/modules/auth'

// Si tous les imports fonctionnent = module OK ✅
```

## 📝 Prochaine Étape

**Objectif**: Mettre à jour tous les imports du projet

**Commande** (à exécuter prudemment):
```bash
# Remplacer tous les imports domain/auth → modules/auth
find src app -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|@/domain/auth|@/modules/auth|g' {} \;

# Répéter pour chaque module...
```

**OU** manuellement au fur et à mesure des besoins (plus sûr).

## ✨ Bénéfices

- ✅ **Navigation simple** - Tout au même endroit
- ✅ **Imports courts** - Un seul import par module
- ✅ **Moins de fragmentation** - Fini les 4 dossiers pour 1 feature
- ✅ **Scalable** - Ajouter un module = créer un dossier
- ✅ **Intuitif** - Structure claire pour nouveaux devs

---

**Status**: Migration des fichiers ✅ | Mise à jour imports ⏳ | Build test ⏳
**Date**: 2025-11-04
