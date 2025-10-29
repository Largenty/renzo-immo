# 🏗️ Plan de Migration Architecture Propre

## 📊 Analyse de la Structure Actuelle

### Structure Actuelle
```
renzo-immo/
├── app/                          # Next.js App Router
│   ├── api/                      # Route handlers
│   ├── auth/                     # Pages auth
│   ├── dashboard/                # Pages dashboard
│   └── layout.tsx
├── src/
│   ├── components/               # Tous les composants UI
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── credits/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── providers/
│   ├── lib/                      # Mélange logique métier + utils
│   │   ├── auth/
│   │   ├── supabase/
│   │   ├── hooks/                # Hooks métier
│   │   └── stores/               # Zustand stores
│   ├── config/
│   └── contexts/
├── types/                        # Types globaux
└── supabase/                     # Migrations SQL
```

### Problèmes Identifiés
- ❌ Logique métier mélangée avec l'infrastructure (hooks + supabase)
- ❌ Pas de séparation claire entre domaines (projects, images, credits, auth)
- ❌ Pas d'abstraction (ports) pour les dépendances externes
- ❌ Types éparpillés entre `types/` et composants
- ❌ Pas de règles métier isolées
- ❌ Stores Zustand couplés à Supabase

---

## 🎯 Nouvelle Structure Cible

```
renzo-immo/
├── app/                                  # Next.js App Router (routage uniquement)
│   ├── (public)/                         # Pages publiques
│   │   └── page.tsx                      # Landing page
│   ├── (auth)/                           # Groupe auth
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/                      # Groupe dashboard (avec layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   ├── credits/
│   │   └── settings/
│   ├── api/                              # Route Handlers (contrôleurs HTTP)
│   │   ├── auth/
│   │   ├── images/
│   │   ├── projects/
│   │   └── credits/
│   └── layout.tsx
│
├── src/
│   ├── components/                       # UI Components (présentation)
│   │   ├── ui/                           # Design system (shadcn)
│   │   ├── shared/                       # Composants partagés (non-domaine)
│   │   │   ├── layout/                   # Navbar, Footer, etc.
│   │   │   └── providers/                # React providers
│   │   └── domain/                       # UI spécifique au domaine
│   │       ├── projects/                 # ProjectCard, ProjectForm, etc.
│   │       ├── images/                   # ImageCard, ImageUploader, etc.
│   │       ├── credits/                  # CreditPackCard, etc.
│   │       └── auth/                     # LoginForm, SignupForm, etc.
│   │
│   ├── domain/                           # ⭐ Cœur métier (logique pure)
│   │   ├── projects/
│   │   │   ├── models/                   # Types, schémas Zod
│   │   │   │   ├── project.ts
│   │   │   │   └── project.schema.ts
│   │   │   ├── business-rules/           # Règles métier pures
│   │   │   │   ├── validate-project-name.ts
│   │   │   │   └── calculate-project-stats.ts
│   │   │   ├── services/                 # Cas d'usage (orchestration)
│   │   │   │   ├── create-project.ts
│   │   │   │   ├── update-project.ts
│   │   │   │   └── delete-project.ts
│   │   │   └── ports/                    # Interfaces abstraites
│   │   │       └── projects-repository.ts
│   │   │
│   │   ├── images/
│   │   │   ├── models/
│   │   │   │   ├── image.ts
│   │   │   │   ├── transformation.ts
│   │   │   │   └── image.schema.ts
│   │   │   ├── business-rules/
│   │   │   │   ├── validate-image-format.ts
│   │   │   │   └── check-image-size.ts
│   │   │   ├── behavior-rules/           # Workflows
│   │   │   │   ├── generate-image.ts
│   │   │   │   └── retry-failed-image.ts
│   │   │   ├── services/
│   │   │   │   ├── upload-image.ts
│   │   │   │   ├── transform-image.ts
│   │   │   │   └── export-images.ts
│   │   │   └── ports/
│   │   │       ├── images-repository.ts
│   │   │       ├── image-storage.ts
│   │   │       └── ai-generator.ts
│   │   │
│   │   ├── credits/
│   │   │   ├── models/
│   │   │   │   └── credit.ts
│   │   │   ├── business-rules/
│   │   │   │   ├── calculate-credit-cost.ts
│   │   │   │   └── validate-credit-balance.ts
│   │   │   ├── services/
│   │   │   │   ├── consume-credits.ts
│   │   │   │   └── get-credit-balance.ts
│   │   │   └── ports/
│   │   │       └── credits-repository.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── models/
│   │   │   │   └── user.ts
│   │   │   ├── business-rules/
│   │   │   │   └── validate-password-strength.ts
│   │   │   ├── services/
│   │   │   │   ├── login.ts
│   │   │   │   ├── signup.ts
│   │   │   │   └── logout.ts
│   │   │   └── ports/
│   │   │       └── auth-provider.ts
│   │   │
│   │   └── styles/
│   │       ├── models/
│   │       │   └── custom-style.ts
│   │       ├── services/
│   │       │   └── get-transformation-types.ts
│   │       └── ports/
│   │           └── styles-repository.ts
│   │
│   ├── infra/                            # ⭐ Implémentations concrètes
│   │   ├── adapters/                     # Adapters vers services externes
│   │   │   ├── projects-repository.supabase.ts
│   │   │   ├── images-repository.supabase.ts
│   │   │   ├── image-storage.supabase.ts
│   │   │   ├── ai-generator.nanobanana.ts
│   │   │   ├── credits-repository.supabase.ts
│   │   │   ├── auth-provider.supabase.ts
│   │   │   └── styles-repository.supabase.ts
│   │   ├── db/                           # Configuration DB
│   │   │   ├── supabase-client.ts
│   │   │   └── supabase-server.ts
│   │   └── ai/                           # Configuration AI
│   │       └── nanobanana-client.ts
│   │
│   ├── lib/                              # Utilitaires techniques
│   │   ├── utils.ts                      # Helpers génériques (cn, etc.)
│   │   ├── logger.ts                     # Logger centralisé
│   │   ├── errors.ts                     # Classes d'erreurs custom
│   │   ├── validation.ts                 # Helpers Zod
│   │   └── image-utils.ts                # Utils traitement image
│   │
│   ├── config/                           # Configuration globale
│   │   ├── app.ts                        # Constantes app
│   │   ├── env.ts                        # Variables d'env (Zod validation)
│   │   └── features.ts                   # Feature flags
│   │
│   └── types/                            # Types globaux uniquement
│       └── global.d.ts
│
├── types/                                # [À SUPPRIMER - migrer vers domain]
├── supabase/                             # Migrations SQL (OK)
└── middleware.ts                         # Middleware Next.js (OK)
```

---

## 🔄 Plan de Migration Détaillé

### Phase 1 : Créer la Structure de Base
1. Créer tous les dossiers de la nouvelle architecture
2. Ne rien supprimer de l'ancien pour l'instant (migration progressive)

### Phase 2 : Domain Layer (Cœur Métier)

#### A. Domaine `projects/`
- **Migrer depuis** : `types/dashboard.ts` (Project)
- **Créer** :
  - `domain/projects/models/project.ts` (types + schémas Zod)
  - `domain/projects/ports/projects-repository.ts` (interface)
  - `domain/projects/services/` (logique depuis `use-projects.ts`)

#### B. Domaine `images/`
- **Migrer depuis** : `types/dashboard.ts` (ImagePair), `src/lib/hooks/use-images.ts`
- **Créer** :
  - `domain/images/models/` (Image, TransformationType, RoomType)
  - `domain/images/ports/` (images-repository, image-storage, ai-generator)
  - `domain/images/services/` (upload, transform, export)
  - `domain/images/business-rules/` (validation format, taille)

#### C. Domaine `credits/`
- **Migrer depuis** : `src/lib/hooks/use-credits.ts`, `types/dashboard.ts`
- **Créer** :
  - `domain/credits/models/credit.ts`
  - `domain/credits/ports/credits-repository.ts`
  - `domain/credits/services/` (consume, get-balance)
  - `domain/credits/business-rules/` (calculate-cost, validate-balance)

#### D. Domaine `auth/`
- **Migrer depuis** : `src/lib/auth/actions.ts`, stores auth
- **Créer** :
  - `domain/auth/models/user.ts`
  - `domain/auth/ports/auth-provider.ts`
  - `domain/auth/services/` (login, signup, logout)

#### E. Domaine `styles/`
- **Migrer depuis** : `src/lib/transformation-types.tsx`, `use-custom-styles.ts`
- **Créer** :
  - `domain/styles/models/custom-style.ts`
  - `domain/styles/ports/styles-repository.ts`
  - `domain/styles/services/get-transformation-types.ts`

### Phase 3 : Infrastructure Layer

#### Créer les Adapters
- `infra/adapters/projects-repository.supabase.ts` (implémente le port)
- `infra/adapters/images-repository.supabase.ts`
- `infra/adapters/image-storage.supabase.ts`
- `infra/adapters/ai-generator.nanobanana.ts`
- `infra/adapters/credits-repository.supabase.ts`
- `infra/adapters/auth-provider.supabase.ts`
- `infra/adapters/styles-repository.supabase.ts`

#### Configuration
- `infra/db/supabase-client.ts` (depuis `src/lib/supabase/client.ts`)
- `infra/db/supabase-server.ts` (depuis `src/lib/supabase/server.ts`)
- `infra/ai/nanobanana-client.ts`

### Phase 4 : Configuration

#### Créer config/ avec validation Zod
```typescript
// config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NANOBANANA_API_KEY: z.string(),
  // ...
})

export const env = envSchema.parse(process.env)
```

### Phase 5 : Composants UI

#### Réorganiser
- `components/ui/` → OK (design system)
- `components/shared/layout/` ← depuis `components/layout/`
- `components/shared/providers/` ← depuis `components/providers/`
- `components/domain/projects/` ← depuis `components/projects/`
- `components/domain/images/` ← depuis `components/upload/`
- `components/domain/credits/` ← depuis `components/credits/`
- `components/domain/auth/` ← depuis `components/auth/`

### Phase 6 : App Router

#### Groupes de routes
- Créer `app/(public)/` pour landing
- Créer `app/(auth)/` pour login/signup
- Créer `app/(dashboard)/` pour pages privées
- Migrer les routes API vers `app/api/` (déjà OK)

### Phase 7 : Mise à Jour des Imports

#### Mettre à jour tous les imports
- Remplacer `@/types/dashboard` par `@/domain/*/models/*`
- Remplacer `@/lib/hooks/use-*` par `@/domain/*/services/*`
- Remplacer `@/lib/supabase/*` par `@/infra/db/*` ou `@/infra/adapters/*`
- Remplacer `@/components/auth/*` par `@/components/domain/auth/*`

### Phase 8 : Nettoyage

#### Supprimer les anciens fichiers
- Supprimer `types/dashboard.ts` (migré vers domain)
- Supprimer `src/lib/hooks/` (migré vers domain/services)
- Supprimer `src/lib/auth/` (migré vers domain/auth)
- Supprimer `src/lib/stores/` (remplacé par services + adapters)
- Supprimer anciens dossiers `components/` (réorganisés)

---

## 📝 Checklist de Migration

### ✅ Étape 1 : Structure
- [ ] Créer `src/domain/` avec tous les sous-dossiers
- [ ] Créer `src/infra/` avec tous les sous-dossiers
- [ ] Créer `src/config/` avec validation env

### ✅ Étape 2 : Domain (Projects)
- [ ] Migrer types Project vers `domain/projects/models/`
- [ ] Créer schémas Zod pour validation
- [ ] Créer port `projects-repository.ts`
- [ ] Extraire logique métier de `use-projects.ts` vers `services/`

### ✅ Étape 3 : Domain (Images)
- [ ] Migrer types Image vers `domain/images/models/`
- [ ] Créer ports (repository, storage, ai-generator)
- [ ] Extraire logique de `use-images.ts` vers `services/`
- [ ] Créer business rules (validation format/taille)

### ✅ Étape 4 : Domain (Credits, Auth, Styles)
- [ ] Migrer credits
- [ ] Migrer auth
- [ ] Migrer styles/transformation-types

### ✅ Étape 5 : Infrastructure
- [ ] Créer tous les adapters Supabase
- [ ] Créer adapter NanoBanana
- [ ] Migrer configuration DB

### ✅ Étape 6 : Components
- [ ] Réorganiser selon domain/
- [ ] Créer components/shared/

### ✅ Étape 7 : Routes
- [ ] Créer groupes (public), (auth), (dashboard)
- [ ] Migrer layouts

### ✅ Étape 8 : Imports
- [ ] Mettre à jour tous les imports
- [ ] Tester l'app

### ✅ Étape 9 : Nettoyage
- [ ] Supprimer anciens fichiers
- [ ] Vérifier qu'il ne reste aucune référence

---

## 🎯 Avantages de Cette Architecture

1. **Séparation des Responsabilités**
   - Domain = logique métier pure
   - Infra = implémentations techniques
   - App = routage et contrôleurs
   - Components = présentation

2. **Testabilité**
   - Domain testable sans dépendances externes
   - Mocking facile des ports
   - Tests unitaires simples

3. **Maintenabilité**
   - Code organisé par domaine métier
   - Facile de trouver où est quoi
   - Évolutions isolées

4. **Flexibilité**
   - Changer Supabase = changer uniquement les adapters
   - Changer NanoBanana = changer un seul adapter
   - Règles métier indépendantes de la techno

5. **Scalabilité**
   - Ajouter un nouveau domaine = nouveau dossier
   - Pas de couplage entre domaines
   - Architecture prête pour du micro-services si besoin

---

## ⚠️ Points d'Attention

1. **Migration Progressive**
   - Ne pas tout casser d'un coup
   - Migrer domaine par domaine
   - Tester après chaque domaine

2. **Stores Zustand**
   - Les remplacer par des services + React Query
   - Ou les garder uniquement pour l'UI state (pas de logique métier)

3. **Server Actions**
   - Utiliser les services domain depuis les server actions
   - Les server actions = couche de transport, pas de logique métier

4. **Type Safety**
   - Utiliser Zod pour valider les inputs
   - Types générés depuis les schémas Zod

---

## 🚀 Commencer la Migration

Veux-tu que je commence la migration ? Si oui, je peux :
1. Commencer par un domaine spécifique (ex: projects)
2. Faire toute la structure d'un coup puis migrer progressivement
3. Te montrer un exemple complet sur un petit domaine d'abord

Quelle approche préfères-tu ?
