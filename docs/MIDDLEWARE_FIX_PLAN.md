# Plan de Correction des Middlewares - Priorisation

## 🎯 Objectif
Corriger les **3 bugs critiques** qui peuvent causer des pertes financières et des doubles charges, puis optimiser progressivement.

---

## 🔴 PHASE 1: BUGS CRITIQUES (4h - À faire IMMÉDIATEMENT)

### Bug #1: Race Condition dans les Réservations
**Impact**: Un utilisateur peut dépenser plus de crédits qu'il n'en possède en envoyant des requêtes parallèles.

**Fichiers à modifier**:
- `src/infrastructure/supabase/credits.repository.ts`

**Changements**:
```typescript
// AVANT (ligne 272-298)
async reserveCredits(userId: string, amount: number, operation: string): Promise<string> {
  const { data, error } = await this.supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description: `[PENDING] ${operation}`,
      metadata: { status: 'pending', operation },
    })
    .select('id')
    .single()

  return data.id
}

// APRÈS (atomique)
async reserveCredits(userId: string, amount: number, operation: string): Promise<string> {
  // ✅ Déduction ATOMIQUE immédiate avec la fonction SQL
  const { data, error } = await this.supabase.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reference_type: 'reservation',
    p_reference_id: null,
    p_description: `[PENDING] ${operation}`,
  })

  if (error) {
    // La fonction SQL gère atomiquement : si pas assez de crédits, elle lève une erreur
    throw new Error(`Failed to reserve credits: ${error.message}`)
  }

  return data // Transaction ID
}
```

---

### Bug #2: Double Déduction dans confirmReservation
**Impact**: L'utilisateur perd le DOUBLE de crédits (une fois à la réservation, une fois à la confirmation).

**Fichiers à modifier**:
- `src/infrastructure/supabase/credits.repository.ts`

**Changements**:
```typescript
// AVANT (ligne 305-350)
async confirmReservation(reservationId: string, metadata?: {...}): Promise<void> {
  const { data: reservation } = await this.supabase
    .from('credit_transactions')
    .select('*')
    .eq('id', reservationId)
    .single()

  const amount = Math.abs(reservation.amount)

  // ❌ DOUBLE DEDUCTION!
  const { error: deductError } = await this.supabase.rpc('deduct_user_credits', {
    p_user_id: reservation.user_id,
    p_amount: amount,
    ...
  })

  await this.supabase.from('credit_transactions').delete().eq('id', reservationId)
}

// APRÈS (mise à jour seulement)
async confirmReservation(reservationId: string, metadata?: {...}): Promise<void> {
  // ✅ Pas de nouvelle déduction - juste mise à jour de PENDING → CONFIRMED
  const { error } = await this.supabase
    .from('credit_transactions')
    .update({
      description: description.replace('[PENDING] ', ''),
      image_quality: metadata?.imageQuality || null,
      image_count: metadata?.imageCount || null,
      related_project_name: metadata?.relatedProjectName || null,
      related_image_id: metadata?.relatedImageId || null,
      metadata: {
        status: 'confirmed',
        operation: metadata?.operation,
      }
    })
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')

  if (error) {
    throw new Error(`Failed to confirm reservation: ${error.message}`)
  }
}
```

---

### Bug #3: cancelReservation ne Rembourse Pas
**Impact**: Si une opération échoue, l'utilisateur perd définitivement ses crédits.

**Fichiers à modifier**:
- `src/infrastructure/supabase/credits.repository.ts`

**Changements**:
```typescript
// AVANT (ligne 356-366)
async cancelReservation(reservationId: string): Promise<void> {
  const { error } = await this.supabase
    .from('credit_transactions')
    .delete()
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')
}

// APRÈS (avec remboursement)
async cancelReservation(reservationId: string): Promise<void> {
  // 1. Récupérer la réservation
  const { data: reservation, error: fetchError } = await this.supabase
    .from('credit_transactions')
    .select('*')
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      // Réservation déjà annulée ou n'existe pas
      return
    }
    throw new Error(`Failed to fetch reservation: ${fetchError.message}`)
  }

  if (!reservation) return

  // 2. ✅ Rembourser les crédits
  const amount = Math.abs(reservation.amount)
  const { error: refundError } = await this.supabase.rpc('add_user_credits', {
    p_user_id: reservation.user_id,
    p_amount: amount,
    p_transaction_type: 'refund',
    p_description: `Refund: ${reservation.description}`,
  })

  if (refundError) {
    throw new Error(`Failed to refund credits: ${refundError.message}`)
  }

  // 3. Supprimer la transaction pending
  await this.supabase
    .from('credit_transactions')
    .delete()
    .eq('id', reservationId)
}
```

---

## 🟡 PHASE 2: BUGS MAJEURS (2h - Cette semaine)

### Bug #4: calculateCreditCostFromBody Consomme le Body

**Fichiers à modifier**:
- `src/lib/api/middleware/credits.ts`

**Solution 1 - Clone de la requête**:
```typescript
export function calculateCreditCostFromBody(costs: { hd: number; standard: number }) {
  return async (request: AuthenticatedRequest): Promise<number> => {
    try {
      // ✅ Clone pour pouvoir lire plusieurs fois
      const clonedRequest = request.clone()
      const body = await clonedRequest.json()
      const quality = body.quality || 'standard'
      return quality === 'hd' ? costs.hd : costs.standard
    } catch {
      return costs.standard
    }
  }
}
```

**Solution 2 - Passer le body parsé** (RECOMMANDÉ):
```typescript
// Supprimer calculateCreditCostFromBody
// Utiliser à la place dans le handler:

async function generateImageHandler(request: CreditRequest) {
  const body = await request.json()
  const validation = validateRequest(generateImageRequestSchema, body)

  // Calculer le coût basé sur le body déjà parsé
  const creditCost = body.quality === 'hd' ? 10 : 1
  request.creditCost = creditCost

  // ...
}

// Et dans l'export:
export const POST = withAuth(
  withCredits(
    generateImageHandler,
    {
      creditCost: async (req) => {
        // ⚠️ Ne plus utiliser calculateCreditCostFromBody
        // Le coût sera défini dans le handler
        return 1 // Valeur par défaut, sera écrasée
      },
      operation: 'generate-image',
    }
  ),
  { requireEmailVerification: true }
);
```

---

### Bug #5: Incohérence Email Verification

**Fichiers à modifier**:
- `src/lib/api/middleware/auth.ts`

**Test à faire**:
```typescript
// Vérifier quelle propriété existe vraiment
console.log('User properties:', Object.keys(user))
console.log('email_confirmed_at:', user.email_confirmed_at)
console.log('confirmed_at:', user.confirmed_at)
```

**Si c'est `confirmed_at`**:
```typescript
// Ligne 97
if (options.requireEmailVerification && !user.confirmed_at) {
```

**Si c'est `email_confirmed_at`** (garder tel quel):
```typescript
// Ligne 97 (actuel)
if (options.requireEmailVerification && !user.email_confirmed_at) {
```

---

### Bug #6: Vérification Balance Redondante

**Fichiers à modifier**:
- `src/lib/api/middleware/credits.ts`

**Changements**:
```typescript
// AVANT (ligne 97-116)
const balance = await repository.getBalance(request.user.id)

if (balance < creditCost) {
  return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
}

// ...plus tard...
if (useReservation) {
  reservationId = await repository.reserveCredits(...)
}

// APRÈS (supprimer la vérification)
// ✅ Supprimer complètement les lignes 97-116
// La fonction SQL deduct_user_credits gère atomiquement

try {
  // 3. Reserve credits (if using reservation system)
  let reservationId: string | null = null

  if (useReservation) {
    reservationId = await repository.reserveCredits(
      request.user.id,
      creditCost,
      operation
    )

    logger.debug('[withCredits] Credits reserved', { ... })
  }
} catch (error: any) {
  // Parser l'erreur de la fonction SQL
  if (error.message.includes('Insufficient credits')) {
    const match = error.message.match(/Required: (\d+), Available: (\d+)/)
    const required = match ? parseInt(match[1]) : creditCost
    const available = match ? parseInt(match[2]) : 0

    logger.warn('[withCredits] Insufficient credits', {
      userId: request.user.id,
      balance: available,
      required,
      operation,
    })

    return NextResponse.json(
      {
        error: 'Insufficient credits',
        message: `You need ${required} credits but only have ${available}`,
        balance: available,
        required,
      },
      { status: 402 }
    )
  }

  // Autres erreurs
  logger.error('[withCredits] Failed to reserve credits', {
    userId: request.user.id,
    creditCost,
    error,
    operation,
  })
  return NextResponse.json(
    { error: 'Failed to reserve credits' },
    { status: 500 }
  )
}
```

---

## 🟠 PHASE 3: REFACTORING (3h - Ce mois)

### Optimisation #1: Service Container

**Nouveau fichier**: `src/lib/api/service-container.ts`

```typescript
/**
 * Service Container pour l'injection de dépendances
 * Évite de créer une nouvelle instance de repository à chaque requête
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseCreditsRepository } from '@/infrastructure/supabase/credits.repository'
import { SupabaseImagesRepository } from '@/infrastructure/supabase/images.repository'
import { SupabaseProjectsRepository } from '@/infrastructure/supabase/projects.repository'

export class ServiceContainer {
  private creditsRepository?: SupabaseCreditsRepository
  private imagesRepository?: SupabaseImagesRepository
  private projectsRepository?: SupabaseProjectsRepository

  constructor(private readonly supabase: SupabaseClient) {}

  getCreditsRepository(): SupabaseCreditsRepository {
    if (!this.creditsRepository) {
      this.creditsRepository = new SupabaseCreditsRepository(this.supabase)
    }
    return this.creditsRepository
  }

  getImagesRepository(): SupabaseImagesRepository {
    if (!this.imagesRepository) {
      this.imagesRepository = new SupabaseImagesRepository(this.supabase)
    }
    return this.imagesRepository
  }

  getProjectsRepository(): SupabaseProjectsRepository {
    if (!this.projectsRepository) {
      this.projectsRepository = new SupabaseProjectsRepository(this.supabase)
    }
    return this.projectsRepository
  }
}

// Attacher au request
export interface ContainerRequest extends AuthenticatedRequest {
  container: ServiceContainer
}
```

**Modifier auth middleware**:
```typescript
// Dans withAuth, ligne 156
const authenticatedRequest = request as AuthenticatedRequest
authenticatedRequest.user = user
authenticatedRequest.supabase = supabase
authenticatedRequest.container = new ServiceContainer(supabase) // ✅ Nouveau
```

**Modifier credits middleware**:
```typescript
// Ligne 74 - AVANT
const repository = new CreditsRepositorySupabase(request.supabase)

// APRÈS
const repository = request.container.getCreditsRepository()
```

---

### Optimisation #2: Typage de composeMiddleware

**Fichier**: `src/lib/api/middleware/auth.ts`

```typescript
// AVANT (ligne 197)
export function composeMiddleware(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// APRÈS
type Middleware<TReq = NextRequest, TRes = NextResponse> = (
  handler: (req: TReq) => Promise<TRes>
) => (req: NextRequest) => Promise<TRes>

export function composeMiddleware<TReq = NextRequest>(
  ...middlewares: Middleware<any, any>[]
) {
  return <THandler extends (req: TReq) => Promise<NextResponse>>(
    handler: THandler
  ) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    ) as (req: NextRequest) => Promise<NextResponse>
  }
}
```

---

### Optimisation #3: Helpers d'invalidation de cache

**Nouveau fichier**: `src/lib/api/cache-invalidation.ts`

```typescript
/**
 * Helpers pour invalider les caches React Query après mutations
 */

import type { QueryClient } from '@tanstack/react-query'

export const CacheKeys = {
  credits: {
    balance: (userId: string) => ['credit-balance', userId],
    stats: (userId: string) => ['credit-stats', userId],
    transactions: (userId: string) => ['credit-transactions', userId],
    weeklyStats: (userId: string) => ['weekly-stats', userId],
  },
  projects: {
    list: (userId: string) => ['projects', userId],
    detail: (projectId: string) => ['project', projectId],
    stats: (userId: string) => ['project-stats', userId],
  },
  images: {
    list: (projectId: string) => ['images', projectId],
    detail: (imageId: string) => ['image', imageId],
  },
} as const

/**
 * Invalider tous les caches liés aux crédits
 */
export function invalidateCreditsCache(queryClient: QueryClient, userId: string) {
  queryClient.invalidateQueries({ queryKey: CacheKeys.credits.balance(userId) })
  queryClient.invalidateQueries({ queryKey: CacheKeys.credits.stats(userId) })
  queryClient.invalidateQueries({ queryKey: CacheKeys.credits.transactions(userId) })
  queryClient.invalidateQueries({ queryKey: CacheKeys.credits.weeklyStats(userId) })
}

/**
 * Invalider tous les caches liés à un projet
 */
export function invalidateProjectCache(
  queryClient: QueryClient,
  userId: string,
  projectId: string
) {
  queryClient.invalidateQueries({ queryKey: CacheKeys.projects.list(userId) })
  queryClient.invalidateQueries({ queryKey: CacheKeys.projects.detail(projectId) })
  queryClient.invalidateQueries({ queryKey: CacheKeys.projects.stats(userId) })
}
```

---

## 🟢 PHASE 4: POLISH (1h - Nice to have)

### Polish #1: Logging Conditionnel
```typescript
// auth.ts ligne 162
if (process.env.NODE_ENV === 'development') {
  logger.debug('[withAuth] Authentication successful', { ... })
}
```

### Polish #2: Validation Max Credit Cost
```typescript
// credits.ts après ligne 85
const MAX_CREDIT_COST = 1000

if (creditCost <= 0 || creditCost > MAX_CREDIT_COST) {
  logger.error('[withCredits] Invalid credit cost', { creditCost })
  return NextResponse.json({ error: 'Invalid credit cost' }, { status: 500 })
}
```

### Polish #3: Supprimer Code Mort
```typescript
// Supprimer composeMiddleware si pas utilisé
// OU l'utiliser dans les routes pour simplifier:

export const POST = composeMiddleware(
  withAuth,
  withCredits({ creditCost: 1, operation: 'generate' })
)(handler)
```

---

## 📋 CHECKLIST DE DÉPLOIEMENT

### Avant de déployer:
- [ ] Tests unitaires pour `reserveCredits` (race condition)
- [ ] Tests d'intégration pour `confirmReservation` (pas de double charge)
- [ ] Tests d'intégration pour `cancelReservation` (remboursement OK)
- [ ] Test manuel: Lancer 10 requêtes parallèles avec 5 crédits → doit en rejeter après avoir utilisé tous les crédits
- [ ] Vérifier les logs Supabase: pas d'erreurs SQL
- [ ] Monitor les transactions: aucune transaction en état PENDING > 5 minutes

### Après déploiement:
- [ ] Monitor les erreurs 402 (Insufficient credits)
- [ ] Monitor les erreurs 500 (Failed to reserve/confirm/cancel)
- [ ] Vérifier que les remboursements apparaissent bien dans `credit_transactions`
- [ ] Dashboard admin: aucune anomalie dans les soldes utilisateurs

---

## 🎯 RÉSUMÉ EFFORT

| Phase | Bugs | Temps | Priorité |
|-------|------|-------|----------|
| Phase 1 | #1, #2, #3 | 4h | 🔴 URGENT |
| Phase 2 | #4, #5, #6 | 2h | 🟡 CETTE SEMAINE |
| Phase 3 | Refactoring | 3h | 🟠 CE MOIS |
| Phase 4 | Polish | 1h | 🟢 NICE TO HAVE |

**Total**: ~10h de travail
**ROI**: Éviter pertes financières + améliorer maintenabilité

---

## 💡 NOTES IMPORTANTES

1. **Ne pas déployer Phase 1 partiellement**: Les 3 bugs sont interdépendants. Il faut tous les fixer ensemble.

2. **Tests requis avant production**: Les bugs #1-#3 peuvent causer des pertes financières réelles. Tests obligatoires.

3. **Migration des données**: Si des réservations PENDING existent en prod, les migrer :
```sql
-- Identifier les réservations pending
SELECT * FROM credit_transactions WHERE metadata->>'status' = 'pending';

-- Si anciennes > 1h, les annuler et rembourser
-- (à adapter selon votre logique métier)
```

4. **Monitoring post-déploiement**: Surveiller pendant 48h pour détecter tout comportement anormal.
