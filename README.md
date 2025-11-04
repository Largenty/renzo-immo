# RENZO - Plateforme SaaS de Transformation d'Images Immobilières par IA

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React Query](https://img.shields.io/badge/React%20Query-5.90-red)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)

**RENZO** est une plateforme SaaS permettant de transformer des photos immobilières grâce à l'intelligence artificielle. Dépersonnalisation, home staging virtuel, et rénovation virtuelle en quelques clics.

---

## 🎯 Fonctionnalités

### ✅ Implémenté

- **Authentification** - Email/password + OAuth (Google) via Supabase
- **Système de Crédits** - Réservation atomique avec refund automatique
- **Génération d'Images IA** - NanoBanana API avec polling de status
- **Gestion de Projets** - Organisation des images transformées
- **Paiements Stripe** - 3 packs de crédits (STARTER, PRO, PREMIUM)
- **Showcase Public** - Partage de projets publics
- **Dashboard Avancé** - Statistiques, historique, gestion
- **Architecture Hexagonale** - Ports & Adapters pattern
- **State Management** - React Query uniquement (pas de Zustand)

### 🚧 En Cours / À Venir

- Tests unitaires et d'intégration
- Monitoring Sentry
- Rate limiting (Upstash Redis)
- Animations GSAP avancées
- Export batch d'images

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Compte Supabase (base de données)
- Compte Stripe (paiements)
- API Key NanoBanana (génération IA)

### Installation

```bash
# 1. Clone le repository
git clone https://github.com/Largenty/renzo-immo.git
cd renzo-immo

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 4. Setup de la base de données
# → Créer un projet sur supabase.com
# → Exécuter les migrations depuis le dossier supabase/

# 5. Lancer le serveur de développement
npm run dev
```

**Site accessible sur**: http://localhost:3000

---

## 📁 Structure du Projet

```
renzo-immo/
├── app/                           # Next.js 14 App Router
│   ├── (marketing)/              # Routes publiques (landing, showcase)
│   ├── dashboard/                # Routes protégées (projets, crédits, settings)
│   ├── api/                      # API Routes
│   │   ├── auth/                # Authentification
│   │   ├── credits/             # Système de crédits
│   │   ├── generate-image/      # Génération IA
│   │   ├── projects/            # CRUD projets
│   │   └── stripe/              # Paiements (checkout, webhook)
│   └── layout.tsx               # Root layout + providers
│
├── src/
│   ├── domain/                   # 🎯 Domain Layer (business logic)
│   │   ├── auth/                # Authentification & utilisateurs
│   │   ├── credits/             # ⚡ Système de crédits (CRITIQUE)
│   │   ├── images/              # Génération & transformation IA
│   │   ├── projects/            # Gestion des projets
│   │   ├── rooms/               # Types de pièces
│   │   └── styles/              # Types de transformations & styles
│   │
│   ├── application/              # 🔄 Application Layer (use cases)
│   │   ├── auth/                # Hooks React Query auth
│   │   ├── credits/             # Hooks crédits
│   │   ├── images/              # Hooks images
│   │   ├── projects/            # Hooks projets
│   │   └── styles/              # Hooks styles
│   │
│   ├── infrastructure/           # 🔌 Infrastructure Layer (adapters)
│   │   ├── supabase/            # Repositories Supabase
│   │   ├── ai/                  # NanoBanana adapter (server + client stub)
│   │   └── stripe/              # Payment adapter
│   │
│   ├── presentation/             # 🎨 Presentation Layer (UI)
│   │   ├── features/            # Components par feature (Atomic Design)
│   │   │   ├── auth/
│   │   │   ├── credits/
│   │   │   ├── projects/
│   │   │   └── upload/
│   │   └── shared/              # Composants partagés
│   │       ├── ui/              # shadcn/ui components
│   │       ├── layout/          # Navbar, Footer
│   │       └── providers/       # QueryProvider, AuthProvider
│   │
│   └── lib/                      # 🛠️ Utilitaires & Configuration
│       ├── api/middleware/      # ⚡ withAuth, withCredits
│       ├── supabase/            # Client Supabase (browser + server)
│       ├── stripe/              # Configuration Stripe
│       ├── prompts/             # Templates de prompts IA
│       ├── validators/          # Schemas Zod
│       └── logger.ts            # Logger unifié
│
├── supabase/                     # 🗄️ Database Migrations
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_storage_buckets.sql
│   └── migrations/              # Migrations incrémentales
│
├── docs/                         # 📚 Documentation
│   ├── ARCHITECTURE.md          # ⭐ Architecture complète
│   ├── FILE_INDEX.md            # 🗺️ Navigation des fichiers clés
│   ├── CODE_STANDARDS.md        # Standards de code
│   ├── CONTRIBUTING.md          # Guide de contribution
│   └── STRIPE_SETUP.md          # Configuration Stripe
│
└── scripts/                      # 🔧 Scripts utilitaires
    ├── setup-stripe-products.ts
    └── verify-credit-packs.ts
```

---

## 🏗️ Architecture

**Pattern**: **Hexagonal Architecture** (Ports & Adapters)

### Layers

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION (React Components, UI)                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  APPLICATION (React Query Hooks, Use Cases)         │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  DOMAIN (Business Logic, Models, Ports)             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  INFRASTRUCTURE (Supabase, AI, Stripe Adapters)     │
└─────────────────────────────────────────────────────┘
```

### Dependency Rule

**Inner layers NEVER depend on outer layers**

✅ Infrastructure → Domain (implements interfaces)
❌ Domain → Infrastructure (forbidden!)

**Voir**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour détails complets

---

## 🎨 Stack Technique

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.9
- **UI Library**: React 18
- **Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Animations**: GSAP 3.13
- **State**: TanStack React Query 5.90
- **Forms**: Zod validation

### Backend

- **Runtime**: Node.js ≥18
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: NanoBanana API
- **Payments**: Stripe 19.2

### Infrastructure

- **Hosting**: Vercel (recommended)
- **Monitoring**: Sentry
- **Rate Limiting**: Upstash Redis (optional)

---

## 🔐 Sécurité

### Système de Crédits (CRITICAL)

Le système de crédits utilise des **transactions SQL atomiques** pour garantir:

- ✅ Pas de race conditions (locks database row)
- ✅ Pas de double déduction
- ✅ Refund automatique en cas d'erreur
- ✅ Audit trail complet

**Fonctions SQL atomiques**:
- `deduct_user_credits()` - Réservation de crédits
- `add_user_credits()` - Ajout de crédits (purchase/refund)

**Pattern de réservation**:
1. Reserve (déduction immédiate)
2. Opération (génération image, etc.)
3. Confirm (ajout metadata) OU Cancel (refund)

### Row Level Security (RLS)

Toutes les tables utilisent RLS pour garantir que:
- Users can only access their own data
- Public projects are visible to everyone
- Admin operations are restricted

### Validation

- ✅ Zod schemas pour toutes les entrées API
- ✅ Sanitization des prompts IA
- ✅ Validation des uploads (format, taille)
- ✅ Rate limiting (TODO)

---

## 📚 Documentation

### Documentation Principale

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture complète du projet
- **[FILE_INDEX.md](docs/FILE_INDEX.md)** - Navigation rapide des fichiers clés
- **[CODE_STANDARDS.md](docs/CODE_STANDARDS.md)** - Standards de code
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Guide de contribution
- **[STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** - Configuration Stripe

### Documentation par Domaine

Chaque domaine a son propre README détaillé:

- [src/domain/auth/README.md](src/domain/auth/README.md) - Authentification
- [src/domain/credits/README.md](src/domain/credits/README.md) - ⚡ Système de crédits
- [src/domain/images/README.md](src/domain/images/README.md) - Génération d'images
- [src/domain/projects/README.md](src/domain/projects/README.md) - Gestion projets
- [src/domain/rooms/README.md](src/domain/rooms/README.md) - Types de pièces
- [src/domain/styles/README.md](src/domain/styles/README.md) - Styles de transformation

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm run build
vercel
```

### Variables d'Environnement Production

Configurer dans Vercel Dashboard:
- Supabase credentials
- Stripe API keys & webhook secret
- NanoBanana API key
- Sentry DSN

### Database Migrations

```bash
# Local
npx supabase db push

# Production
# → Exécuter manuellement via Supabase Dashboard
```

---

## 📊 Scripts Disponibles

```bash
npm run dev          # Serveur développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run analyze      # Bundle analyzer
```

---

## 🤝 Contribution

Nous accueillons les contributions! Voir [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour:

- Setup environnement
- Workflow Git
- Standards de code
- Process de review
- Guide d'ajout de features

---

## 📝 License

ISC

---

## 🔗 Links

- **Repository**: [github.com/Largenty/renzo-immo](https://github.com/Largenty/renzo-immo)
- **Issues**: [github.com/Largenty/renzo-immo/issues](https://github.com/Largenty/renzo-immo/issues)
- **Documentation**: [docs/](docs/)

---

## 🙏 Credits

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **AI Generation**: NanoBanana

---

**Maintenu par**: Dev Team
**Dernière mise à jour**: 2025-11-04
