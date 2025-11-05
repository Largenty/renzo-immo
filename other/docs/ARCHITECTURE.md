# Architecture du Projet RENZO

## Vue d'ensemble

RENZO est une plateforme SaaS de transformation d'images immobilières utilisant l'IA. Le projet suit une architecture hexagonale (Ports & Adapters) avec une séparation stricte entre domaines métier, infrastructure et présentation.

## Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.9
- **UI**: React 18, Radix UI, shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Animation**: GSAP 3.13
- **State Management**: TanStack React Query 5.90 (pas de Zustand)
- **Forms**: React Hook Form + Zod 4.1

### Backend
- **Runtime**: Node.js ≥18
- **API**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **IA**: NanoBanana API (transformation d'images)
- **Payments**: Stripe 19.2

### Infrastructure
- **Monitoring**: Sentry
- **Rate Limiting**: Upstash Redis
- **Image Processing**: Sharp 0.34

## Architecture Hexagonale

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Features   │  │    Shared    │  │    UI     │ │
│  │  (Atomic)    │  │  (Providers) │  │(shadcn/ui)│ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   APPLICATION                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Use Cases   │  │    Hooks     │  │   API     │ │
│  │   (Query)    │  │  (React)     │  │  Routes   │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                     DOMAIN                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Models     │  │Business Rules│  │   Ports   │ │
│  │  (Entities)  │  │  (Services)  │  │(Interfaces)│ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Supabase   │  │      AI      │  │   Stripe  │ │
│  │  (Adapters)  │  │(NanoBanana)  │  │ (Payment) │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
```

## Structure des Dossiers

### `/src`

#### `/src/domain` - Cœur Métier
Contient toute la logique métier, indépendante de toute infrastructure.

**Structure par domaine**:
```
domain/
├── auth/           # Authentification & utilisateurs
├── credits/        # Système de crédits
├── images/         # Transformation d'images
├── projects/       # Gestion des projets
├── rooms/          # Types de pièces
└── styles/         # Styles de transformation
```

**Structure interne de chaque domaine**:
```
{domain}/
├── models/             # Entités & types TypeScript
├── business-rules/     # Règles métier pures
├── services/          # Services du domaine
├── ports/             # Interfaces (contracts)
└── index.ts           # Barrel export
```

**Principes**:
- ✅ Pas de dépendances externes (Supabase, Stripe, etc.)
- ✅ Pure TypeScript/JavaScript
- ✅ Testable unitairement sans mocks
- ✅ Représente le langage métier

#### `/src/application` - Use Cases
Orchestration de la logique métier, implémentation des use cases.

**Structure**:
```
application/
├── auth/
│   └── use-auth.ts         # Hook React Query: useCurrentUser, useLogin, etc.
├── credits/
│   └── use-credits.ts      # Hook: useCreditBalance, usePurchaseCredits
├── images/
│   └── use-images.ts       # Hook: useGenerateImage, useProjectImages
├── projects/
│   └── use-projects.ts     # Hook: useProjects, useCreateProject
└── styles/
    └── use-styles.ts       # Hook: useAllTransformationTypes
```

**Principes**:
- ✅ Hooks React Query pour le data fetching
- ✅ Orchestration entre domaine et infrastructure
- ✅ Gestion du cache et invalidation
- ✅ Error handling unifié

#### `/src/infrastructure` - Adapters
Implémentations concrètes des ports du domaine.

**Structure**:
```
infrastructure/
├── supabase/
│   ├── credits.repository.ts      # ICreditsRepository
│   ├── projects.repository.ts     # IProjectsRepository
│   ├── project-storage.adapter.ts # IProjectStorage
│   └── auth-provider.supabase.ts  # IAuthProvider
├── ai/
│   ├── nanobanana.adapter.ts        # IAIGenerator (server)
│   └── nanobanana-client.adapter.ts # IAIGenerator (client stub)
└── stripe/
    └── payment.adapter.ts           # IPaymentProvider
```

**Principes**:
- ✅ Implémente les interfaces du domaine
- ✅ Gère les appels API externes
- ✅ Contient toute la logique d'infrastructure
- ✅ Séparation client/server (pour éviter importation serveur dans client)

#### `/src/presentation` - UI Components
Composants React organisés selon Atomic Design.

**Structure**:
```
presentation/
├── features/              # Par feature
│   ├── auth/
│   │   ├── atoms/        # Boutons, inputs spécifiques
│   │   ├── molecules/    # Formulaires
│   │   └── organisms/    # Panneaux complets
│   ├── projects/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   └── ...
└── shared/               # Composants partagés
    ├── ui/              # shadcn/ui components
    ├── layout/          # Navbar, Footer, etc.
    ├── providers/       # QueryProvider, AuthProvider
    └── error-boundary/  # Error handling UI
```

**Principes**:
- ✅ Composants présentationnels purs
- ✅ Pas de logique métier
- ✅ Consomment les hooks de l'application layer
- ✅ Organisation Atomic Design

#### `/src/lib` - Utilitaires & Configuration

**Structure**:
```
lib/
├── api/
│   └── middleware/
│       ├── auth.ts        # withAuth middleware
│       └── credits.ts     # withCredits middleware
├── auth/
│   └── config.ts          # Configuration Supabase Auth
├── supabase/
│   ├── client.ts          # Client Supabase (browser)
│   └── server.ts          # Server Supabase (SSR)
├── stripe/
│   ├── stripe.ts          # Instance Stripe serveur
│   └── products.ts        # Configuration produits
├── prompts/
│   └── prompt-templates.ts # Templates de prompts IA
├── validators/
│   ├── api-schemas.ts     # Validation Zod des APIs
│   ├── password-validator.ts
│   └── prompt-sanitizer.ts
├── monitoring/
│   └── sentry.ts          # Configuration Sentry
└── logger.ts              # Logger unifié
```

**Principes**:
- ✅ Utilitaires partagés
- ✅ Configuration centralisée
- ✅ Pas de logique métier

### `/app` - Next.js App Router

**Structure**:
```
app/
├── (marketing)/          # Routes publiques
│   ├── page.tsx         # Landing page
│   └── showcase/        # Projets publics
├── dashboard/           # Routes protégées
│   ├── page.tsx        # Vue d'ensemble
│   ├── projects/       # Gestion projets
│   ├── credits/        # Achat crédits
│   └── settings/       # Paramètres utilisateur
├── api/                # API Routes
│   ├── auth/
│   ├── credits/
│   ├── projects/
│   ├── generate-image/
│   └── stripe/
├── layout.tsx          # Layout racine
└── globals.css         # Styles globaux
```

## Flux de Données

### 1. Lecture de Données (Query)

```
[UI Component] → [React Query Hook] → [Repository] → [Supabase]
                      ↓ cache
                 [QueryClient]
```

**Exemple**: Afficher la liste des projets
1. `ProjectsList` appelle `useProjects()` (hook React Query)
2. `useProjects()` appelle `projectsRepository.getAll()`
3. `projectsRepository` fait l'appel Supabase
4. Données cachées par React Query (5min par défaut)
5. Component re-render avec les données

### 2. Mutation de Données

```
[UI Component] → [React Query Mutation] → [API Route] → [Service] → [Repository]
                      ↓ invalidate                        ↓ business logic
                 [QueryClient]                      [Domain Rules]
```

**Exemple**: Créer un nouveau projet
1. `CreateProjectForm` appelle `createProject.mutate(data)`
2. Mutation fait POST vers `/api/projects`
3. API Route utilise middleware `withAuth`
4. Service applique règles métier
5. Repository persiste en DB
6. Cache React Query invalidé
7. Liste des projets re-fetch automatiquement

### 3. Génération d'Image avec Crédits

```
[UI] → [useMutation] → [API /generate-image]
                             ↓
                    [withAuth + withCredits]
                             ↓
                    [1. Reserve Credits]
                    [2. Call NanoBanana API]
                    [3a. Success → Confirm Reservation]
                    [3b. Error → Cancel Reservation (refund)]
```

**Sécurité Importante**:
- Réservation atomique des crédits (SQL function)
- Pas de race condition possible
- Refund automatique en cas d'échec
- Transactions ACID garanties

## Système de Crédits

### Architecture

Le système de crédits est **critique** car il implique de l'argent. Utilisation de **transactions atomiques SQL** pour garantir l'intégrité.

### Fonctions SQL Atomiques

**`deduct_user_credits()`**:
```sql
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  ...
) RETURNS UUID AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Lock user row
  SELECT credits_balance INTO v_current_balance
  FROM users WHERE id = p_user_id FOR UPDATE;

  -- Check balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct and insert transaction (atomic)
  UPDATE users SET credits_balance = credits_balance - p_amount
  WHERE id = p_user_id;

  INSERT INTO credit_transactions ...
  RETURNING id;
END;
$$ LANGUAGE plpgsql;
```

**`add_user_credits()`**:
```sql
-- Similar but adds credits instead of deducting
```

### Flux de Réservation

1. **Reserve**: Appel `deduct_user_credits()` avec status PENDING
2. **Opération**: Génération d'image, etc.
3. **Confirm**: Update transaction PENDING → CONFIRMED (avec metadata)
4. **Cancel**: Appel `add_user_credits()` pour refund + delete pending transaction

### Middleware `withCredits`

Protège les API routes qui consomment des crédits:

```typescript
export function withCredits(
  handler: NextRequest => Promise<Response>,
  options: { creditCost: number, operation: string }
) {
  return withAuth(async (request) => {
    // 1. Reserve credits (atomic)
    const reservationId = await repository.reserveCredits(
      request.user.id,
      options.creditCost,
      options.operation
    );

    try {
      // 2. Execute operation
      const response = await handler(request);

      // 3. Confirm reservation with metadata
      await repository.confirmReservation(reservationId, metadata);

      return response;
    } catch (error) {
      // 4. Auto-cancel on error (refund)
      await repository.cancelReservation(reservationId);
      throw error;
    }
  });
}
```

**Avantages**:
- ✅ Atomic operations (pas de race condition)
- ✅ Refund automatique en cas d'erreur
- ✅ Audit trail complet (metadata)
- ✅ Pas de double déduction
- ✅ Pas de balance check redondant

## Authentification

### Supabase Auth

**Configuration**: [src/lib/auth/config.ts](src/lib/auth/config.ts)

**Features**:
- Email/Password avec confirmation
- OAuth (Google)
- Session persistence
- JWT tokens
- Row Level Security (RLS)

### Middleware `withAuth`

Protège les API routes nécessitant authentification:

```typescript
export function withAuth(handler: NextRequest => Promise<Response>) {
  return async (request: NextRequest) => {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Inject user in request
    request.user = user;

    return handler(request);
  };
}
```

### Hooks d'Authentification

```typescript
// application/auth/use-auth.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }) =>
      supabase.auth.signInWithPassword({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

## Intégration Stripe

### Configuration

**Products**: [src/lib/stripe/products.ts](src/lib/stripe/products.ts)

Produits synchronisés entre code et Stripe Dashboard:

```typescript
export const CREDIT_PACKS = [
  {
    id: 'STARTER',
    credits: 50,
    priceId: process.env.STRIPE_PRICE_STARTER,
    displayPrice: '9.99€',
  },
  // ...
];
```

### Flux d'Achat

```
[UI: Select Pack] → [API: /stripe/checkout]
                         ↓ create session
                    [Stripe Checkout]
                         ↓ payment
                    [Webhook: /stripe/webhook]
                         ↓ signature validation
                    [Add Credits to User]
                         ↓
                    [Client: /credits/success]
```

### Webhook Handler

**Endpoint**: [app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts)

**Events**:
- `checkout.session.completed`: Ajouter crédits
- `payment_intent.payment_failed`: Logger erreur

**Sécurité**:
- ✅ Signature validation Stripe
- ✅ Idempotency (prevent double credit)
- ✅ Error handling & logging

## Génération d'Images (IA)

### NanoBanana API

**Adapter**: [src/infrastructure/ai/nanobanana.adapter.ts](src/infrastructure/ai/nanobanana.adapter.ts)

**Processus**:
1. Upload image originale vers Supabase Storage
2. Générer presigned URL (24h TTL)
3. Appel NanoBanana API avec prompt + settings
4. Polling du status (pending → processing → completed)
5. Download image transformée
6. Upload vers Supabase Storage
7. Cleanup presigned URLs

### Prompt Engineering

**Templates**: [src/lib/prompts/prompt-templates.ts](src/lib/prompts/prompt-templates.ts)

Structure:
```typescript
export function buildPrompt({
  transformationType,  // staging, renovation, depersonalization
  roomType,           // bedroom, living_room, etc.
  style,              // modern, industrial, etc.
  customPrompt        // user additions
}) {
  const basePrompt = TRANSFORMATION_PROMPTS[transformationType];
  const roomContext = ROOM_CONTEXTS[roomType];
  const styleModifiers = STYLE_MODIFIERS[style];

  return `${basePrompt} ${roomContext} ${styleModifiers} ${customPrompt}`;
}
```

**Validation**: [src/lib/validators/prompt-sanitizer.ts](src/lib/validators/prompt-sanitizer.ts)
- Filtrage mots interdits
- Limite de caractères
- Suppression d'injections

## Monitoring & Observability

### Sentry

**Configuration**: [src/lib/monitoring/sentry.ts](src/lib/monitoring/sentry.ts)

**Tracked**:
- Erreurs frontend (React Error Boundary)
- Erreurs backend (API routes)
- Performance monitoring
- User feedback

**Usage**:
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // operation
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'image-generation' },
    user: { id: userId },
  });
  throw error;
}
```

### Logger

**Fichier**: [src/lib/logger.ts](src/lib/logger.ts)

Wrapper autour de `console` avec niveaux de log:

```typescript
logger.debug('Debug info', { data });
logger.info('Operation completed');
logger.warn('Warning condition');
logger.error('Error occurred', error);
```

### Rate Limiting

**Provider**: Upstash Redis

**Configuration**: Par endpoint API

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// Dans API route
const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

## Testing Strategy

### Unit Tests

**Target**: Domain layer (business rules, services)

**Framework**: Jest + Testing Library

**Exemple**:
```typescript
// src/domain/credits/business-rules/credit-cost.test.ts
describe('calculateImageCost', () => {
  it('should calculate cost based on quality', () => {
    expect(calculateImageCost('high', 1)).toBe(3);
    expect(calculateImageCost('standard', 1)).toBe(2);
  });
});
```

### Integration Tests

**Target**: API routes, repositories

**Setup**: Test Supabase instance

**Exemple**:
```typescript
describe('POST /api/generate-image', () => {
  it('should reserve credits before generation', async () => {
    // Mock user with 10 credits
    // Call endpoint
    // Verify credits reserved
    // Verify image generated
    // Verify credits confirmed
  });
});
```

### E2E Tests

**Framework**: Playwright

**Target**: Critical user flows
- Sign up → Buy credits → Generate image
- Create project → Upload → Transform → Download

## Performance Optimization

### React Query Cache

**Configuration**: [src/presentation/shared/providers/query-provider.tsx](src/presentation/shared/providers/query-provider.tsx)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5min cache
      gcTime: 10 * 60 * 1000,        // 10min garbage collection
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: false,          // Don't refetch if still fresh
    },
  },
});
```

**Stratégies**:
- Prefetch on hover (projects list)
- Optimistic updates (mutations)
- Pagination (infinite queries)
- Background refetch

### Image Optimization

**Sharp**: Server-side image processing

```typescript
import sharp from 'sharp';

await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside' })
  .webp({ quality: 85 })
  .toBuffer();
```

**Next.js Image**: Automatic optimization

```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  width={1920}
  height={1080}
  alt="..."
  loading="lazy"
  quality={85}
/>
```

### Bundle Optimization

**Techniques**:
- Dynamic imports (`next/dynamic`)
- Tree shaking (ESM exports)
- Code splitting par route
- Minimize dependencies

**Analysis**: `npm run analyze`

## Security Best Practices

### Environment Variables

**Fichier**: `.env.local` (gitignored)

**Required**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# NanoBanana
NANOBANANA_API_KEY=

# Monitoring
SENTRY_DSN=
```

### API Security

**Layers**:
1. **Rate Limiting**: Upstash Redis (10 req/10s par défaut)
2. **Authentication**: withAuth middleware (JWT validation)
3. **Authorization**: Row Level Security (Supabase RLS)
4. **Validation**: Zod schemas (input sanitization)
5. **CSRF**: Next.js built-in protection

### Database Security

**Row Level Security** (RLS):

```sql
-- Only users can see their own projects
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Only users can update their own projects
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);
```

### Secrets Management

- ✅ Never commit `.env` files
- ✅ Use environment variables
- ✅ Rotate API keys regularly
- ✅ Separate dev/prod keys
- ✅ Use Vercel environment variables in production

## Deployment

### Vercel

**Framework Preset**: Next.js

**Build Command**: `npm run build`

**Environment Variables**: Set in Vercel Dashboard

**Regions**: Auto (CDN)

### Supabase

**Database**: PostgreSQL 15

**Migrations**: Manual via Supabase Dashboard ou CLI

```bash
npx supabase db push
```

**Storage Buckets**:
- `images`: Uploaded/generated images
- `projects`: Project cover images

### CI/CD

**GitHub Actions** (si configuré):
1. Lint & Type check
2. Unit tests
3. Build
4. Deploy to Vercel (auto)

## Common Patterns

### Adding a New Feature

1. **Define Domain Model** (`src/domain/{feature}/models/`)
2. **Create Port Interface** (`src/domain/{feature}/ports/`)
3. **Implement Adapter** (`src/infrastructure/`)
4. **Create Use Case Hook** (`src/application/{feature}/`)
5. **Build UI Components** (`src/presentation/features/{feature}/`)
6. **Add API Route** (if needed) (`app/api/{feature}/`)
7. **Export from Barrel** (`src/domain/{feature}/index.ts`)

### Error Handling

**Consistent pattern**:

```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', { error, context });

  // If user-facing
  toast.error('Une erreur est survenue. Veuillez réessayer.');

  // If API
  return NextResponse.json({
    error: 'Operation failed',
    message: error.message,
  }, { status: 500 });
}
```

### Data Fetching

**Always use React Query**:

```typescript
// ✅ Good
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsRepository.getAll(),
  });
}

// ❌ Bad - no caching, no refetch management
const [projects, setProjects] = useState([]);
useEffect(() => {
  projectsRepository.getAll().then(setProjects);
}, []);
```

## Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)

### Internal Docs
- [FILE_INDEX.md](./FILE_INDEX.md) - Navigation rapide des fichiers clés
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Configuration Stripe
- Chaque domaine a son propre README: [src/domain/{domain}/README.md](src/domain/)

### Team
- **Git**: [github.com/Largenty/renzo-immo](https://github.com/Largenty/renzo-immo)
- **Issues**: Use GitHub Issues
- **Code Review**: Required before merge to main

---

**Version**: 1.0.0
**Last Updated**: 2025-11-04
**Maintainer**: Development Team
