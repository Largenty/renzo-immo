# Index de Navigation - Fichiers Clés

Ce document fournit une navigation rapide vers les fichiers les plus importants du projet, organisés par fonctionnalité.

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture complète du projet
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Configuration Stripe
- [PROMPT_FORMAT_UPDATE.md](./PROMPT_FORMAT_UPDATE.md) - Format des prompts IA

## 🎯 Configuration Racine

- [package.json](../package.json) - Dependencies & scripts
- [tsconfig.json](../tsconfig.json) - TypeScript config
- [next.config.js](../next.config.js) - Next.js config
- [tailwind.config.js](../tailwind.config.js) - Tailwind config
- [.env.local](../.env.local) - Environment variables (gitignored)

## 🏗️ App Router (Next.js)

### Pages Principales

- [app/layout.tsx](../app/layout.tsx) - Root layout avec providers
- [app/page.tsx](../app/page.tsx) - Landing page
- [app/dashboard/page.tsx](../app/dashboard/page.tsx) - Dashboard principal
- [app/dashboard/projects/page.tsx](../app/dashboard/projects/page.tsx) - Liste des projets
- [app/dashboard/projects/[id]/page.tsx](../app/dashboard/projects/[id]/page.tsx) - Détails projet
- [app/dashboard/credits/page.tsx](../app/dashboard/credits/page.tsx) - Gestion crédits

### API Routes

#### Authentication
- [app/api/auth/change-password/route.ts](../app/api/auth/change-password/route.ts)
- [app/api/auth/logout/route.ts](../app/api/auth/logout/route.ts)
- [app/api/auth/verify-password/route.ts](../app/api/auth/verify-password/route.ts)

#### Credits
- [app/api/credits/balance/route.ts](../app/api/credits/balance/route.ts) - Balance utilisateur
- [app/api/credits/packs/route.ts](../app/api/credits/packs/route.ts) - Packs disponibles

#### Projects
- [app/api/projects/route.ts](../app/api/projects/route.ts) - GET all, POST create
- [app/api/projects/[id]/route.ts](../app/api/projects/[id]/route.ts) - GET one, PUT update, DELETE
- [app/api/projects/[id]/toggle-public/route.ts](../app/api/projects/[id]/toggle-public/route.ts)

#### Images
- [app/api/generate-image/route.ts](../app/api/generate-image/route.ts) - ⚡ Génération IA
- [app/api/check-generation-status/route.ts](../app/api/check-generation-status/route.ts) - Polling status

#### Stripe
- [app/api/stripe/checkout/route.ts](../app/api/stripe/checkout/route.ts) - Créer session
- [app/api/stripe/verify-session/route.ts](../app/api/stripe/verify-session/route.ts) - Vérifier paiement
- [app/api/stripe/webhook/route.ts](../app/api/stripe/webhook/route.ts) - ⚡ Webhook handler

#### Showcase
- [app/api/showcase/route.ts](../app/api/showcase/route.ts) - Projets publics
- [app/api/showcase/[username]/route.ts](../app/api/showcase/[username]/route.ts)
- [app/api/showcase/[username]/[slug]/route.ts](../app/api/showcase/[username]/[slug]/route.ts)

## 🎨 Domain Layer

### Auth
- [src/domain/auth/models/user.ts](../src/domain/auth/models/user.ts) - User model
- [src/domain/auth/ports/auth-provider.ts](../src/domain/auth/ports/auth-provider.ts) - IAuthProvider
- [src/domain/auth/services/auth.service.ts](../src/domain/auth/services/auth.service.ts)
- [src/domain/auth/index.ts](../src/domain/auth/index.ts) - Barrel export

### Credits
- [src/domain/credits/models/credit-pack.ts](../src/domain/credits/models/credit-pack.ts) - CreditPack model
- [src/domain/credits/models/credit-transaction.ts](../src/domain/credits/models/credit-transaction.ts)
- [src/domain/credits/ports/credits-repository.ts](../src/domain/credits/ports/credits-repository.ts) - ICreditsRepository
- [src/domain/credits/business-rules/credit-cost.ts](../src/domain/credits/business-rules/credit-cost.ts) - ⚡ Règles de coût
- [src/domain/credits/services/credit-reservation.service.ts](../src/domain/credits/services/credit-reservation.service.ts)
- [src/domain/credits/index.ts](../src/domain/credits/index.ts)

### Images
- [src/domain/images/models/image.ts](../src/domain/images/models/image.ts) - Image model
- [src/domain/images/ports/ai-generator.ts](../src/domain/images/ports/ai-generator.ts) - ⚡ IAIGenerator
- [src/domain/images/ports/image-repository.ts](../src/domain/images/ports/image-repository.ts)
- [src/domain/images/services/manage-images.ts](../src/domain/images/services/manage-images.ts)
- [src/domain/images/index.ts](../src/domain/images/index.ts)

### Projects
- [src/domain/projects/models/project.ts](../src/domain/projects/models/project.ts) - Project model
- [src/domain/projects/ports/projects-repository.ts](../src/domain/projects/ports/projects-repository.ts)
- [src/domain/projects/ports/project-storage.ts](../src/domain/projects/ports/project-storage.ts) - IProjectStorage
- [src/domain/projects/services/project.service.ts](../src/domain/projects/services/project.service.ts)
- [src/domain/projects/index.ts](../src/domain/projects/index.ts)

### Rooms
- [src/domain/rooms/models/room.ts](../src/domain/rooms/models/room.ts) - Room model
- [src/domain/rooms/ports/rooms-repository.ts](../src/domain/rooms/ports/rooms-repository.ts)
- [src/domain/rooms/index.ts](../src/domain/rooms/index.ts)

### Styles
- [src/domain/styles/models/transformation-type.ts](../src/domain/styles/models/transformation-type.ts)
- [src/domain/styles/models/custom-style.ts](../src/domain/styles/models/custom-style.ts)
- [src/domain/styles/models/room-specification.ts](../src/domain/styles/models/room-specification.ts)
- [src/domain/styles/models/furniture.ts](../src/domain/styles/models/furniture.ts)
- [src/domain/styles/ports/styles-repository.ts](../src/domain/styles/ports/styles-repository.ts)
- [src/domain/styles/index.ts](../src/domain/styles/index.ts)

## 🔌 Infrastructure Layer

### Supabase Adapters
- [src/infrastructure/supabase/auth-provider.supabase.ts](../src/infrastructure/supabase/auth-provider.supabase.ts) - Auth adapter
- [src/infrastructure/supabase/credits.repository.ts](../src/infrastructure/supabase/credits.repository.ts) - ⚡ Credits repo
- [src/infrastructure/supabase/projects.repository.ts](../src/infrastructure/supabase/projects.repository.ts)
- [src/infrastructure/supabase/project-storage.adapter.ts](../src/infrastructure/supabase/project-storage.adapter.ts) - Storage adapter

### AI Adapters
- [src/infrastructure/ai/nanobanana.adapter.ts](../src/infrastructure/ai/nanobanana.adapter.ts) - ⚡ NanoBanana (server)
- [src/infrastructure/ai/nanobanana-client.adapter.ts](../src/infrastructure/ai/nanobanana-client.adapter.ts) - Client stub
- [src/infrastructure/ai/index.ts](../src/infrastructure/ai/index.ts)

### Stripe Adapters
- [src/infrastructure/stripe/payment.adapter.ts](../src/infrastructure/stripe/payment.adapter.ts)

## 🎯 Application Layer (Use Cases)

### React Query Hooks

- [src/application/auth/use-auth.ts](../src/application/auth/use-auth.ts) - useCurrentUser, useLogin, useLogout
- [src/application/credits/use-credits.ts](../src/application/credits/use-credits.ts) - useCreditBalance, useCreditPacks
- [src/application/images/use-images.ts](../src/application/images/use-images.ts) - ⚡ useGenerateImage, useProjectImages
- [src/application/projects/use-projects.ts](../src/application/projects/use-projects.ts) - useProjects, useCreateProject
- [src/application/styles/use-styles.ts](../src/application/styles/use-styles.ts) - useAllTransformationTypes

## 🎨 Presentation Layer

### Providers
- [src/presentation/shared/providers/query-provider.tsx](../src/presentation/shared/providers/query-provider.tsx) - ⚡ React Query setup
- [src/presentation/shared/providers/auth-provider.tsx](../src/presentation/shared/providers/auth-provider.tsx)

### Layout
- [src/presentation/shared/layout/navbar.tsx](../src/presentation/shared/layout/navbar.tsx)
- [src/presentation/shared/layout/navbar-refactored.tsx](../src/presentation/shared/layout/navbar-refactored.tsx)
- [src/presentation/shared/layout/footer.tsx](../src/presentation/shared/layout/footer.tsx)

### Features - Auth
- [src/presentation/features/auth/organisms/login-form.tsx](../src/presentation/features/auth/organisms/login-form.tsx)
- [src/presentation/features/auth/organisms/signup-form.tsx](../src/presentation/features/auth/organisms/signup-form.tsx)
- [src/presentation/features/auth/molecules/password-input.tsx](../src/presentation/features/auth/molecules/password-input.tsx)

### Features - Projects
- [src/presentation/features/projects/organisms/project-list.tsx](../src/presentation/features/projects/organisms/project-list.tsx)
- [src/presentation/features/projects/organisms/project-card.tsx](../src/presentation/features/projects/organisms/project-card.tsx)
- [src/presentation/features/projects/organisms/create-project-dialog.tsx](../src/presentation/features/projects/organisms/create-project-dialog.tsx)

### Features - Upload
- [src/presentation/features/upload/components/image-uploader.tsx](../src/presentation/features/upload/components/image-uploader.tsx) - ⚡ Upload UI
- [src/presentation/features/upload/components/generation-settings.tsx](../src/presentation/features/upload/components/generation-settings.tsx)

### Features - Credits
- [src/presentation/features/credits/credit-pack-card.tsx](../src/presentation/features/credits/credit-pack-card.tsx)
- [src/presentation/features/credits/credit-balance.tsx](../src/presentation/features/credits/credit-balance.tsx)

### Shared UI Components (shadcn/ui)
- [src/presentation/shared/ui/button.tsx](../src/presentation/shared/ui/button.tsx)
- [src/presentation/shared/ui/dialog.tsx](../src/presentation/shared/ui/dialog.tsx)
- [src/presentation/shared/ui/input.tsx](../src/presentation/shared/ui/input.tsx)
- [src/presentation/shared/ui/card.tsx](../src/presentation/shared/ui/card.tsx)
- [src/presentation/shared/ui/toast.tsx](../src/presentation/shared/ui/toast.tsx)

## 🛠️ Lib - Utilitaires

### API Middleware
- [src/lib/api/middleware/auth.ts](../src/lib/api/middleware/auth.ts) - ⚡ withAuth
- [src/lib/api/middleware/credits.ts](../src/lib/api/middleware/credits.ts) - ⚡ withCredits

### Supabase Clients
- [src/lib/supabase/client.ts](../src/lib/supabase/client.ts) - Client browser
- [src/lib/supabase/server.ts](../src/lib/supabase/server.ts) - ⚡ Server client (SSR)

### Stripe
- [src/lib/stripe/stripe.ts](../src/lib/stripe/stripe.ts) - ⚡ Stripe instance serveur
- [src/lib/stripe/products.ts](../src/lib/stripe/products.ts) - Configuration produits

### Validators
- [src/lib/validators/api-schemas.ts](../src/lib/validators/api-schemas.ts) - ⚡ Zod schemas API
- [src/lib/validators/password-validator.ts](../src/lib/validators/password-validator.ts)
- [src/lib/validators/prompt-sanitizer.ts](../src/lib/validators/prompt-sanitizer.ts)

### Prompts
- [src/lib/prompts/prompt-templates.ts](../src/lib/prompts/prompt-templates.ts) - ⚡ Templates IA

### Auth
- [src/lib/auth/config.ts](../src/lib/auth/config.ts) - Supabase Auth config

### Monitoring
- [src/lib/monitoring/sentry.ts](../src/lib/monitoring/sentry.ts) - Sentry setup
- [src/lib/logger.ts](../src/lib/logger.ts) - Logger unifié

### Utilities
- [src/lib/gsap-utils.ts](../src/lib/gsap-utils.ts) - GSAP helpers
- [src/lib/utils.ts](../src/lib/utils.ts) - General utilities

## 📦 Types

- [types/dashboard.ts](../types/dashboard.ts) - Dashboard types
- [types/supabase.ts](../types/supabase.ts) - Supabase types (auto-generated)

## 🗃️ Database

### Migrations (Supabase)

Les migrations sont dans `supabase/` (non préfixé `migrations/`):

#### Core Schema
- [supabase/001_initial_schema.sql](../supabase/001_initial_schema.sql) - Tables principales
- [supabase/002_rls_policies.sql](../supabase/002_rls_policies.sql) - Row Level Security
- [supabase/003_storage_buckets.sql](../supabase/003_storage_buckets.sql) - Storage setup

#### Features
- [supabase/20251103_create_credits_system.sql](../supabase/migrations/20251103_create_credits_system.sql) - ⚡ Système crédits
- [supabase/20251103_create_stats_functions.sql](../supabase/migrations/20251103_create_stats_functions.sql) - Stats functions
- [supabase/20251102_add_room_type_specifications.sql](../supabase/20251102_add_room_type_specifications.sql)
- [supabase/20251031_add_renovation_palettes.sql](../supabase/20251031_add_renovation_palettes.sql)

#### Modular Approach
- [supabase/MODULAR_001_core_tables.sql](../supabase/MODULAR_001_core_tables.sql)
- [supabase/MODULAR_002_seed_room_specs.sql](../supabase/MODULAR_002_seed_room_specs.sql)
- [supabase/MODULAR_003_seed_furniture_catalog.sql](../supabase/MODULAR_003_seed_furniture_catalog.sql)
- [supabase/MODULAR_004_home_staging_styles.sql](../supabase/MODULAR_004_home_staging_styles.sql)
- [supabase/MODULAR_005_default_presets.sql](../supabase/MODULAR_005_default_presets.sql)

## 🧪 Scripts Utilitaires

- [scripts/apply-migrations-20251103.sh](../scripts/apply-migrations-20251103.sh)
- [scripts/setup-stripe-products.ts](../scripts/setup-stripe-products.ts)
- [scripts/verify-credit-packs.ts](../scripts/verify-credit-packs.ts)
- [scripts/test-db-connection.js](../scripts/test-db-connection.js)
- [scripts/test-credit-deduction.js](../scripts/test-credit-deduction.js)

## 🔥 Fichiers Critiques (à ne pas casser)

Ces fichiers sont **critiques** pour le bon fonctionnement de l'app:

1. [src/infrastructure/supabase/credits.repository.ts](../src/infrastructure/supabase/credits.repository.ts) - Gestion atomique crédits
2. [src/lib/api/middleware/credits.ts](../src/lib/api/middleware/credits.ts) - Réservation/confirmation crédits
3. [app/api/stripe/webhook/route.ts](../app/api/stripe/webhook/route.ts) - Ajout crédits après paiement
4. [app/api/generate-image/route.ts](../app/api/generate-image/route.ts) - Génération IA
5. [src/infrastructure/ai/nanobanana.adapter.ts](../src/infrastructure/ai/nanobanana.adapter.ts) - Appels API IA
6. [src/presentation/shared/providers/query-provider.tsx](../src/presentation/shared/providers/query-provider.tsx) - Cache React Query
7. [src/lib/supabase/server.ts](../src/lib/supabase/server.ts) - Client Supabase SSR
8. [src/lib/stripe/stripe.ts](../src/lib/stripe/stripe.ts) - Instance Stripe

## 📖 Navigation par Cas d'Usage

### "Je veux comprendre comment fonctionne X"

#### Authentification
1. Start: [src/lib/auth/config.ts](../src/lib/auth/config.ts)
2. Hooks: [src/application/auth/use-auth.ts](../src/application/auth/use-auth.ts)
3. UI: [src/presentation/features/auth/organisms/login-form.tsx](../src/presentation/features/auth/organisms/login-form.tsx)
4. Middleware: [src/lib/api/middleware/auth.ts](../src/lib/api/middleware/auth.ts)

#### Système de Crédits
1. Start: [docs/ARCHITECTURE.md#système-de-crédits](./ARCHITECTURE.md#système-de-crédits)
2. Repository: [src/infrastructure/supabase/credits.repository.ts](../src/infrastructure/supabase/credits.repository.ts)
3. Middleware: [src/lib/api/middleware/credits.ts](../src/lib/api/middleware/credits.ts)
4. Rules: [src/domain/credits/business-rules/credit-cost.ts](../src/domain/credits/business-rules/credit-cost.ts)
5. Hooks: [src/application/credits/use-credits.ts](../src/application/credits/use-credits.ts)

#### Génération d'Images
1. Start: [app/api/generate-image/route.ts](../app/api/generate-image/route.ts)
2. Adapter: [src/infrastructure/ai/nanobanana.adapter.ts](../src/infrastructure/ai/nanobanana.adapter.ts)
3. Port: [src/domain/images/ports/ai-generator.ts](../src/domain/images/ports/ai-generator.ts)
4. Prompts: [src/lib/prompts/prompt-templates.ts](../src/lib/prompts/prompt-templates.ts)
5. Hooks: [src/application/images/use-images.ts](../src/application/images/use-images.ts)
6. UI: [src/presentation/features/upload/components/image-uploader.tsx](../src/presentation/features/upload/components/image-uploader.tsx)

#### Paiements Stripe
1. Start: [docs/STRIPE_SETUP.md](./STRIPE_SETUP.md)
2. Config: [src/lib/stripe/products.ts](../src/lib/stripe/products.ts)
3. Checkout: [app/api/stripe/checkout/route.ts](../app/api/stripe/checkout/route.ts)
4. Webhook: [app/api/stripe/webhook/route.ts](../app/api/stripe/webhook/route.ts)
5. UI: [src/presentation/features/credits/credit-pack-card.tsx](../src/presentation/features/credits/credit-pack-card.tsx)

### "Je veux ajouter une nouvelle fonctionnalité"

#### Nouvelle Feature Complète
1. Read: [docs/ARCHITECTURE.md#adding-a-new-feature](./ARCHITECTURE.md#adding-a-new-feature)
2. Domain: Create `src/domain/{feature}/`
3. Infrastructure: Create adapter in `src/infrastructure/`
4. Application: Create hook in `src/application/{feature}/`
5. Presentation: Create UI in `src/presentation/features/{feature}/`
6. API: Create route in `app/api/{feature}/`

#### Nouveau Type de Transformation
1. Database: Add to `transformation_types` table
2. Prompts: Update [src/lib/prompts/prompt-templates.ts](../src/lib/prompts/prompt-templates.ts)
3. UI: Update [src/presentation/features/upload/components/generation-settings.tsx](../src/presentation/features/upload/components/generation-settings.tsx)

#### Nouveau Pack de Crédits
1. Stripe: Create product in Dashboard
2. Config: Update [src/lib/stripe/products.ts](../src/lib/stripe/products.ts)
3. Database: Update `credit_packs` table
4. UI: Auto-fetched via React Query

## 🔍 Recherche Rapide

### Par Technologie

**React Query**:
- [src/presentation/shared/providers/query-provider.tsx](../src/presentation/shared/providers/query-provider.tsx)
- [src/application/*/use-*.ts](../src/application/)

**Supabase**:
- [src/lib/supabase/](../src/lib/supabase/)
- [src/infrastructure/supabase/](../src/infrastructure/supabase/)

**Stripe**:
- [src/lib/stripe/](../src/lib/stripe/)
- [app/api/stripe/](../app/api/stripe/)

**NanoBanana**:
- [src/infrastructure/ai/](../src/infrastructure/ai/)

**Zod**:
- [src/lib/validators/](../src/lib/validators/)

### Par Concept

**Middleware**: [src/lib/api/middleware/](../src/lib/api/middleware/)

**Ports & Adapters**:
- Ports: [src/domain/*/ports/](../src/domain/)
- Adapters: [src/infrastructure/](../src/infrastructure/)

**Business Rules**: [src/domain/*/business-rules/](../src/domain/)

**React Query Hooks**: [src/application/](../src/application/)

**UI Components**: [src/presentation/](../src/presentation/)

---

**⚡ = Fichier critique ou particulièrement important**

**Dernière mise à jour**: 2025-11-04
