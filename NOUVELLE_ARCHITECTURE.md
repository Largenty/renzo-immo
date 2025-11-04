# 🎉 NOUVELLE ARCHITECTURE - Modules Simplifiés

## ✅ Migration Terminée !

Tous les modules ont été créés et organisés. Voici ce qui a changé.

## 📁 Nouvelle Structure (Simple & Intuitive)

```
src/
├── modules/          # 🎯 NOUVEAU - Tout par fonctionnalité
│   ├── auth/        # Authentification
│   ├── credits/     # Crédits & paiements
│   ├── projects/    # Gestion projets
│   ├── images/      # Génération IA
│   ├── rooms/       # Types de pièces
│   └── styles/      # Styles de transformation
│
├── shared/          # 🎯 NOUVEAU - Composants réutilisables
│   ├── components/  # UI (Button, Dialog, etc.)
│   ├── hooks/       # Hooks communs
│   └── utils/       # Utilitaires
│
└── lib/             # Configuration (Supabase, Stripe, etc.)
```

### ⚠️ Ancienne Structure (À Supprimer Plus Tard)

```
src/
├── domain/          # ❌ À supprimer (remplacé par modules/)
├── application/     # ❌ À supprimer
├── infrastructure/  # ❌ À supprimer
└── presentation/    # ❌ À supprimer
```

## 🎯 Comment Ça Marche ?

### Exemple: Module Auth

**Avant** (4 dossiers différents):
```
src/domain/auth/models/user.ts
src/application/auth/use-auth.ts
src/infrastructure/supabase/auth-provider.ts
src/presentation/features/auth/organisms/login-form.tsx
```

**Après** (1 seul dossier):
```
src/modules/auth/
├── types.ts              # User, Session, schemas
├── hooks/use-auth.ts     # useLogin, useSignup
├── api/auth.service.ts   # SupabaseAuthAdapter
├── components/           # LoginForm, SignupForm, etc.
└── index.ts              # Exports tout
```

### Import Simplifié

**Avant**:
```typescript
import { User } from '@/domain/auth/models/user'
import { useLogin } from '@/application/auth/use-auth'
import { LoginForm } from '@/presentation/features/auth/organisms/login-form'
```

**Après**:
```typescript
import { User, useLogin, LoginForm } from '@/modules/auth'
```

## 📦 Les 6 Modules

### 1. 🔐 auth
- Types: User, Session, SignInInput
- Hooks: useCurrentUser, useLogin, useSignup
- API: SupabaseAuthAdapter
- Components: LoginForm, SignupForm, PasswordInput
- Utils: validatePassword

### 2. 💳 credits (CRITIQUE - Système atomique)
- Types: CreditPack, CreditTransaction
- Hooks: useCreditBalance, usePurchaseCredits
- API: SupabaseCreditsRepository (avec transactions SQL atomiques)
- Components: CreditPackCard, CreditsOverviewCard, UsageHistoryTable
- Utils: calculateImageCost

### 3. 📁 projects
- Types: Project, IProjectsRepository, IProjectStorage
- Hooks: useProjects, useCreateProject, useUpdateProject
- API: SupabaseProjectsRepository, SupabaseProjectStorage
- Components: ProjectHeader, ProjectForm, ImageCard, ShareDialog

### 4. 🖼️ images (Génération IA)
- Types: Image, GenerateImageInput, IAIGenerator
- Hooks: useGenerateImage, useProjectImages, usePollingStatus
- API: NanoBananaAIGenerator (server), NanoBananaAIGeneratorClient (stub)
- Components: ImageUploader, FileDropZone, SimpleImageUpload

### 5. 🏠 rooms
- Types: Room, IRoomsRepository
- Hooks: useRooms, useCreateRoom

### 6. 🎨 styles
- Types: TransformationType, CustomStyle, IStylesRepository
- Hooks: useAllTransformationTypes, useCustomStyles

## 🔧 Module shared/

Composants réutilisables PARTOUT:

```typescript
// UI Components
import { Button, Dialog, Card } from '@/shared'

// Hooks
import { useToast } from '@/shared'

// Utils
import { cn } from '@/shared'
```

## 🚀 Prochaines Étapes

### Étape 1: Mettre à Jour les Imports

**Option A - Script automatique** (⚠️ Faire un backup avant):
```bash
./scripts/update-imports.sh
```

**Option B - Manuellement** (plus sûr):
- Quand tu travailles sur un fichier, remplace les imports:
  - `@/domain/auth` → `@/modules/auth`
  - `@/application/credits` → `@/modules/credits`
  - etc.

### Étape 2: Tester le Build

```bash
npm run build
```

Si erreurs TypeScript:
1. Vérifier les imports
2. Corriger les exports manquants dans `index.ts` des modules

### Étape 3: Supprimer Anciens Dossiers

**⚠️ UNIQUEMENT après que le build fonctionne!**

```bash
rm -rf src/domain
rm -rf src/application
rm -rf src/infrastructure/supabase  # Garder infrastructure/ai pour l'instant
rm -rf src/presentation/features
```

## 📝 Exemples d'Utilisation

### Créer un Login

```typescript
// app/login/page.tsx
'use client'

import { useLogin, LoginForm } from '@/modules/auth'
import { Button } from '@/shared'

export default function LoginPage() {
  return (
    <div>
      <h1>Connexion</h1>
      <LoginForm />
    </div>
  )
}
```

### Afficher le Solde de Crédits

```typescript
'use client'

import { useCreditBalance } from '@/modules/credits'

export function CreditBalance() {
  const { data: balance } = useCreditBalance()

  return <div>{balance} crédits</div>
}
```

### Lister les Projets

```typescript
'use client'

import { useProjects, ProjectHeader } from '@/modules/projects'
import { Card } from '@/shared'

export function ProjectsList() {
  const { data: projects } = useProjects()

  return (
    <div>
      {projects?.map(project => (
        <Card key={project.id}>
          <ProjectHeader project={project} />
        </Card>
      ))}
    </div>
  )
}
```

## 🎯 Avantages

✅ **Navigation simple** - Chercher "auth" ? → `src/modules/auth/`
✅ **Imports courts** - Un seul import au lieu de 4
✅ **Moins de fragmentation** - Tout au même endroit
✅ **Scalable** - Ajouter une feature = créer un module
✅ **Intuitif** - Facile pour les nouveaux devs

## 📚 Documentation

- [modules/README.md](src/modules/README.md) - Guide détaillé des modules
- [docs/REFACTO_MODULES.md](docs/REFACTO_MODULES.md) - Rapport de migration
- [scripts/update-imports.sh](scripts/update-imports.sh) - Script de mise à jour

## 🆘 Aide

### "Je ne trouve plus un fichier"

Ancienne location → Nouvelle location:
- `src/domain/auth/models/user.ts` → `src/modules/auth/types.ts`
- `src/application/auth/use-auth.ts` → `src/modules/auth/hooks/use-auth.ts`
- `src/infrastructure/supabase/credits.repository.ts` → `src/modules/credits/api/credits.repository.ts`
- `src/presentation/features/auth/organisms/login-form.tsx` → `src/modules/auth/components/LoginForm.tsx`

### "Import ne fonctionne pas"

```typescript
// ❌ Ancien import ne fonctionne plus
import { User } from '@/domain/auth/models/user'

// ✅ Nouveau import
import { User } from '@/modules/auth'
```

### "Type d'export introuvable"

Vérifier que le type est exporté dans `modules/{module}/index.ts`

Si manquant, ajouter:
```typescript
// modules/auth/index.ts
export * from './types'  // ← Exporte tous les types
```

## 🎉 Résultat

**Avant**: Architecture hexagonale (complexe mais académique)
**Après**: Architecture par modules (simple et pragmatique)

**Temps gagné**: ~50% moins de navigation dans les dossiers !

---

**Date**: 2025-11-04
**Status**: Migration des fichiers ✅ | Imports à mettre à jour ⏳
