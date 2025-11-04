# Analyse approfondie des Middlewares - Problèmes et Améliorations

## 🔴 PROBLÈMES CRITIQUES

### 1. **BUG CRITIQUE**: Race Condition dans `reserveCredits()`

**Fichier**: `src/infrastructure/supabase/credits.repository.ts:272-298`

```typescript
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
```

**Problème**: La réservation crée une transaction "pending" SANS vérifier ni déduire le solde réel de l'utilisateur. Cela signifie que :
- L'utilisateur peut avoir 10 crédits
- Lancer 5 requêtes simultanées de 5 crédits chacune
- Toutes les 5 réservations réussissent (car elles n'affectent pas le solde)
- Résultat : l'utilisateur utilise 25 crédits alors qu'il n'en a que 10

**Impact**: **CRITIQUE** - Permet à un utilisateur malicieux de dépasser son solde en envoyant des requêtes parallèles.

**Solution**:
```typescript
async reserveCredits(userId: string, amount: number, operation: string): Promise<string> {
  // ✅ ATOMIQUE: Déduire IMMÉDIATEMENT le solde avec la fonction SQL
  const { data, error } = await this.supabase.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_reference_type: 'reservation',
    p_reference_id: null,
    p_description: `[PENDING] ${operation}`,
  })

  if (error) {
    throw new Error(`Failed to reserve credits: ${error.message}`)
  }

  return data // Returns transaction ID
}
```

---

### 2. **BUG CRITIQUE**: Double Déduction dans `confirmReservation()`

**Fichier**: `src/infrastructure/supabase/credits.repository.ts:305-350`

```typescript
async confirmReservation(reservationId: string, metadata?: {...}): Promise<void> {
  // 1. Récupère la réservation pending
  const { data: reservation } = await this.supabase
    .from('credit_transactions')
    .select('*')
    .eq('id', reservationId)
    .single()

  const amount = Math.abs(reservation.amount)

  // 2. ⚠️ DÉDUCTION AVEC deduct_user_credits
  const { error: deductError } = await this.supabase.rpc('deduct_user_credits', {
    p_user_id: reservation.user_id,
    p_amount: amount,  // ❌ DOUBLE DEDUCTION!
    ...
  })

  // 3. Supprime la transaction pending
  await this.supabase.from('credit_transactions').delete().eq('id', reservationId)
}
```

**Problème**: Si on implémente la solution #1 (déduire dans `reserveCredits`), alors `confirmReservation` déduit ENCORE une fois. L'utilisateur perd le double de crédits !

**Solution avec réservation atomique**:
```typescript
async confirmReservation(reservationId: string, metadata?: {...}): Promise<void> {
  // ✅ Simplement mettre à jour la transaction de PENDING à CONFIRMED
  const { error } = await this.supabase
    .from('credit_transactions')
    .update({
      description: reservation.description.replace('[PENDING] ', ''),
      image_quality: metadata?.imageQuality,
      image_count: metadata?.imageCount,
      related_project_name: metadata?.relatedProjectName,
      related_image_id: metadata?.relatedImageId,
      metadata: { ...reservation.metadata, status: 'confirmed' }
    })
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')

  if (error) {
    throw new Error(`Failed to confirm reservation: ${error.message}`)
  }
}
```

---

### 3. **BUG MAJEUR**: `cancelReservation()` ne rembourse pas

**Fichier**: `src/infrastructure/supabase/credits.repository.ts:356-366`

```typescript
async cancelReservation(reservationId: string): Promise<void> {
  const { error } = await this.supabase
    .from('credit_transactions')
    .delete()
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')
}
```

**Problème**: Si `reserveCredits` déduit le solde (solution #1), alors `cancelReservation` doit REMBOURSER. Actuellement, elle supprime juste la transaction sans rendre les crédits.

**Solution**:
```typescript
async cancelReservation(reservationId: string): Promise<void> {
  // 1. Récupérer la réservation
  const { data: reservation } = await this.supabase
    .from('credit_transactions')
    .select('*')
    .eq('id', reservationId)
    .eq('metadata->>status', 'pending')
    .single()

  if (!reservation) return // Déjà annulée

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

## 🟡 PROBLÈMES MAJEURS

### 4. **FAILLE DE LOGIQUE**: `calculateCreditCostFromBody()` consomme le body

**Fichier**: `src/lib/api/middleware/credits.ts:306-319`

```typescript
export function calculateCreditCostFromBody(costs: { hd: number; standard: number }) {
  return async (request: AuthenticatedRequest): Promise<number> => {
    try {
      const body = await request.json()  // ❌ CONSOMME LE STREAM!
      const quality = body.quality || 'standard'
      return quality === 'hd' ? costs.hd : costs.standard
    } catch {
      return costs.standard
    }
  }
}
```

**Problème**: `request.json()` peut être appelé **une seule fois**. Une fois appelé dans le middleware, le handler ne peut plus lire le body !

**Impact**: Le handler crash avec "Body already read" ou reçoit `null`.

**Solution**:
```typescript
export function calculateCreditCostFromBody(costs: { hd: number; standard: number }) {
  return async (request: AuthenticatedRequest): Promise<number> => {
    try {
      // ✅ Cloner la requête pour pouvoir lire le body plusieurs fois
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

**Ou mieux**: Passer le body parsé comme paramètre :
```typescript
export function calculateCreditCostFromParsedBody(
  body: any,
  costs: { hd: number; standard: number }
): number {
  const quality = body.quality || 'standard'
  return quality === 'hd' ? costs.hd : costs.standard
}
```

---

### 5. **INCOHÉRENCE**: Vérification d'email utilise `confirmed_at` au lieu de `email_confirmed_at`

**Fichier**: `src/lib/api/middleware/auth.ts:97`

```typescript
if (options.requireEmailVerification && !user.email_confirmed_at) {
  // ...
}
```

**Mais dans generate-image (ancien code)**:
```typescript
if (!user.confirmed_at) {  // ❌ Propriété différente!
  // ...
}
```

**Problème**: Supabase utilise `email_confirmed_at` mais le code original utilisait `confirmed_at`. Il faut vérifier quelle est la bonne propriété.

**Vérification nécessaire**: Inspecter le type `User` de Supabase pour confirmer.

---

### 6. **REDONDANCE**: Vérification de balance PUIS réservation

**Fichier**: `src/lib/api/middleware/credits.ts:97-150`

```typescript
// 2. Check balance
const balance = await repository.getBalance(request.user.id)

if (balance < creditCost) {
  return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
}

// 4. Reserve credits (if using reservation system)
if (useReservation) {
  reservationId = await repository.reserveCredits(...)
}
```

**Problème**:
1. On vérifie le solde (1 query)
2. On réserve (1 query)
3. Entre les 2, une autre requête peut consommer les crédits → race condition

**Solution**: Supprimer la vérification manuelle, laisser la fonction SQL `deduct_user_credits` gérer atomiquement :
```typescript
// ✅ Pas de vérification préalable - la fonction SQL lève une exception si insuffisant
if (useReservation) {
  try {
    reservationId = await repository.reserveCredits(...)
  } catch (error) {
    if (error.message.includes('Insufficient credits')) {
      return NextResponse.json({
        error: 'Insufficient credits',
        message: `You need ${creditCost} credits`,
      }, { status: 402 })
    }
    throw error
  }
}
```

---

## 🟠 PROBLÈMES MODÉRÉS

### 7. **INEFFICACITÉ**: Création d'un nouveau repository à chaque requête

**Fichier**: `src/lib/api/middleware/credits.ts:74`

```typescript
export function withCredits(handler: CreditHandler, options: CreditMiddlewareOptions) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    const repository = new CreditsRepositorySupabase(request.supabase)  // ❌ Nouvelle instance à chaque fois!
    // ...
  }
}
```

**Problème**: On crée une nouvelle instance du repository pour chaque requête. Pas grave en soi, mais si le repository avait des caches ou des connexions, ce serait problématique.

**Recommandation**: C'est acceptable pour l'instant, mais avec un Service Container (Phase 2), on pourrait réutiliser les instances.

---

### 8. **MANQUE DE TYPAGE**: `composeMiddleware` utilise `any`

**Fichier**: `src/lib/api/middleware/auth.ts:197-203`

```typescript
export function composeMiddleware(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}
```

**Problème**: Perte totale de la sécurité TypeScript. Impossible de détecter des erreurs de composition.

**Solution avec types génériques**:
```typescript
type Middleware<T = NextRequest, R = NextResponse> = (
  handler: (req: T) => Promise<R>
) => (req: NextRequest) => Promise<R>

export function composeMiddleware<T = NextRequest>(
  ...middlewares: Middleware<any, any>[]
) {
  return <H extends (req: T) => Promise<NextResponse>>(handler: H) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    ) as (req: NextRequest) => Promise<NextResponse>
  }
}
```

---

### 9. **LOGGING EXCESSIF**: 4 logs pour une seule authentification

**Fichier**: `src/lib/api/middleware/auth.ts`

```typescript
logger.warn('[withAuth] Authentication error', ...) // ligne 76
logger.warn('[withAuth] No user found', ...)        // ligne 87
logger.warn('[withAuth] Email not verified', ...)   // ligne 98
logger.debug('[withAuth] Authentication successful', ...) // ligne 162
```

**Problème**: Sur une API à fort trafic, cela génère énormément de logs. Le debug log devrait être conditionnel.

**Solution**:
```typescript
// Seulement en dev
if (process.env.NODE_ENV === 'development') {
  logger.debug('[withAuth] Authentication successful', ...)
}
```

---

## 🟢 PROBLÈMES MINEURS

### 10. **INCOHÉRENCE DE NOMMAGE**: `CreditsRepositorySupabase` vs pattern

**Fichier**: `src/lib/api/middleware/credits.ts:16`

```typescript
import { CreditsRepositorySupabase } from '@/infrastructure/supabase/credits.repository'
```

**Mais le fichier s'appelle**: `SupabaseCreditsRepository` (ligne 58 du fichier)

**Problème**: Incohérence entre le nom de l'export et le nom de la classe.

**Recommandation**: Uniformiser sur `SupabaseCreditsRepository` partout.

---

### 11. **CODE MORT**: `composeMiddleware` n'est utilisé nulle part

**Fichier**: `src/lib/api/middleware/auth.ts:197-203`

**Problème**: Cette fonction n'est jamais utilisée dans le code.

**Recommandation**: Soit l'utiliser, soit la supprimer pour réduire la surface d'attaque.

---

### 12. **MANQUE DE VALIDATION**: `creditCost <= 0` mais pas `creditCost > MAX`

**Fichier**: `src/lib/api/middleware/credits.ts:85-95`

```typescript
if (creditCost <= 0) {
  logger.error('[withCredits] Invalid credit cost', ...)
  return NextResponse.json({ error: 'Invalid credit cost configuration' }, { status: 500 })
}
```

**Problème**: On vérifie les valeurs négatives/nulles, mais pas les valeurs aberrantes (ex: 999999 crédits).

**Solution**:
```typescript
const MAX_CREDIT_COST = 1000 // Définir une limite raisonnable

if (creditCost <= 0 || creditCost > MAX_CREDIT_COST) {
  logger.error('[withCredits] Invalid credit cost', { creditCost, userId: request.user.id })
  return NextResponse.json(
    { error: 'Invalid credit cost configuration' },
    { status: 500 }
  )
}
```

---

## 🔵 REDONDANCES ET OPTIMISATIONS

### 13. **DUPLICATION**: Gestion d'erreur identique 3 fois dans credits.ts

**Lignes 199-223, 240-251, 264-271**

Même pattern répété :
```typescript
try {
  await repository.someOperation()
  logger.info('Success', ...)
} catch (error) {
  logger.error('Failed', ...)
  return NextResponse.json({ error: 'Operation succeeded but credit deduction failed' }, { status: 500 })
}
```

**Solution**: Extraire dans une fonction helper :
```typescript
async function handleCreditOperation(
  operation: () => Promise<void>,
  context: { userId: string; operation: string; creditCost: number }
): Promise<void> {
  try {
    await operation()
    logger.info('[withCredits] Credits operation successful', context)
  } catch (error) {
    logger.error('[withCredits] Credits operation failed', { ...context, error })
    throw new Error('Operation succeeded but credit deduction failed')
  }
}
```

---

### 14. **INEFFICACITÉ**: Appel inutile à `getBalance` quand on utilise la réservation

**Fichier**: `src/lib/api/middleware/credits.ts:98`

```typescript
const balance = await repository.getBalance(request.user.id)  // ❌ Query inutile si useReservation = true!

if (balance < creditCost) {
  return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
}
```

**Problème**: Si `useReservation = true`, la fonction SQL `deduct_user_credits` va DÉJÀ vérifier le solde. On fait 2 queries au lieu d'1.

**Solution**: Supprimer cette vérification et laisser la fonction SQL gérer :
```typescript
// ✅ Pas de vérification préalable - économise 1 query
if (useReservation) {
  try {
    reservationId = await repository.reserveCredits(request.user.id, creditCost, operation)
  } catch (error) {
    // La fonction SQL lève une erreur si solde insuffisant
    if (error.message.includes('Insufficient credits')) {
      const match = error.message.match(/Required: (\d+), Available: (\d+)/)
      const required = match ? parseInt(match[1]) : creditCost
      const available = match ? parseInt(match[2]) : 0

      return NextResponse.json({
        error: 'Insufficient credits',
        message: `You need ${required} credits but only have ${available}`,
        balance: available,
        required,
      }, { status: 402 })
    }
    throw error
  }
}
```

---

### 15. **REDONDANCE**: Métadonnées définies dans handler ET middleware

**Fichier**: `app/api/generate-image/route.ts:114-120`

```typescript
// ✅ Credits are handled by middleware - add metadata for transaction
request.transactionMetadata = {
  imageQuality: 'standard',
  imageCount: 1,
  relatedProjectId: image.project_id,
  relatedProjectName: 'Image Generation',
  relatedImageId: imageId,
};
```

**Problème**: Le handler doit connaître la structure interne du middleware. Meilleure approche : passer les métadonnées comme option du middleware.

**Solution alternative**:
```typescript
export const POST = withAuth(
  withCredits(
    generateImageHandler,
    {
      creditCost: 1,
      operation: 'generate-image',
      useReservation: false,
      // ✅ Métadonnées définies ici
      getMetadata: (request) => ({
        imageQuality: 'standard',
        imageCount: 1,
        // ... extraire du body ou de la request
      })
    }
  ),
  { requireEmailVerification: true }
);
```

---

## 📊 RÉSUMÉ DES IMPACTS

| Problème | Sévérité | Impact | Effort Fix |
|----------|----------|--------|------------|
| #1 Race condition réservation | 🔴 CRITIQUE | Perte financière | 2h |
| #2 Double déduction | 🔴 CRITIQUE | Double charge client | 1h |
| #3 Pas de remboursement | 🔴 MAJEUR | Perte crédits | 1h |
| #4 Body consommé | 🟡 MAJEUR | Crash handler | 30min |
| #5 Incohérence email check | 🟡 MAJEUR | Auth cassée | 15min |
| #6 Redondance balance check | 🟠 MODÉRÉ | Race condition | 30min |
| #7 New repository instance | 🟠 MODÉRÉ | Performance | Phase 2 |
| #8 composeMiddleware any | 🟠 MODÉRÉ | Type safety | 1h |
| #9 Logging excessif | 🟢 MINEUR | Performance | 15min |
| #10 Naming inconsistency | 🟢 MINEUR | Confusion | 5min |
| #11 Code mort | 🟢 MINEUR | Maintenance | 5min |
| #12 Pas de max validation | 🟢 MINEUR | Abus potentiel | 10min |
| #13 Duplication error handling | 🔵 REFACTOR | Maintenabilité | 30min |
| #14 Query inutile getBalance | 🔵 REFACTOR | Performance | 15min |
| #15 Métadonnées en double | 🔵 REFACTOR | Couplage | 1h |

**Total temps de fix estimé**: ~8h30
**Problèmes critiques à fixer immédiatement**: #1, #2, #3 (4h)

---

## ✅ CE QUI EST BIEN FAIT

1. **Séparation des responsabilités** : Auth et crédits sont bien séparés
2. **Composabilité** : `withAuth(withCredits(...))` fonctionne bien
3. **Logging structuré** : Tous les logs incluent le contexte nécessaire
4. **Gestion d'erreurs** : Try-catch exhaustifs avec rollback
5. **Documentation** : Excellents commentaires et exemples
6. **Typage fort** : Interfaces claires (`AuthenticatedRequest`, `CreditRequest`)

---

## 🎯 RECOMMANDATIONS PRIORITAIRES

### URGENT (cette semaine) :
1. **Fixer #1, #2, #3** : Système de réservation atomique
2. **Fixer #4** : Clone de la requête ou changement d'approche
3. **Vérifier #5** : Confirmer la propriété email avec Supabase

### IMPORTANT (ce mois) :
4. **Fixer #6** : Supprimer redondance balance check
5. **Fixer #8** : Typage strict de `composeMiddleware`
6. **Implémenter #7** : Service Container (Phase 2)

### NICE TO HAVE :
7. Optimisations diverses (#9, #11, #12, #14)
8. Refactoring qualité (#13, #15)
