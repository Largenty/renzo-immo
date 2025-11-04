# Domain: Credits

## Vue d'ensemble

Le domaine **Credits** gère le système de crédits de l'application. C'est un **domaine critique** car il implique de l'argent réel via Stripe.

## Responsabilités

- Gestion du solde de crédits des utilisateurs
- Système de réservation/confirmation atomique
- Transactions de crédits (débit/crédit)
- Packs de crédits (pricing)
- Refunds automatiques en cas d'erreur
- Audit trail des transactions

## Structure

```
credits/
├── models/
│   ├── credit-pack.ts          # Credit pack offerings
│   └── credit-transaction.ts   # Transaction history
├── ports/
│   └── credits-repository.ts   # ICreditsRepository interface
├── services/
│   └── credit-reservation.service.ts  # Reservation logic
├── business-rules/
│   └── credit-cost.ts          # Pricing rules
└── index.ts
```

## Models

### CreditPack

```typescript
interface CreditPack {
  id: string                    // 'STARTER', 'PRO', 'PREMIUM'
  name: string                  // Display name
  credits: number               // Number of credits
  priceInCents: number          // Price in cents
  stripePriceId: string         // Stripe Price ID
  popular?: boolean             // Featured pack
  discount?: number             // % discount
}
```

### CreditTransaction

```typescript
interface CreditTransaction {
  id: string
  userId: string
  amount: number                // Positive = credit, Negative = debit
  balanceBefore: number
  balanceAfter: number
  type: 'purchase' | 'usage' | 'refund' | 'adjustment'
  status: 'pending' | 'completed' | 'cancelled'
  referenceType?: 'image' | 'project'
  referenceId?: string
  metadata?: {
    imageQuality?: 'standard' | 'high'
    imageCount?: number
    relatedProjectName?: string
    stripeSessionId?: string
  }
  createdAt: Date
}
```

## Business Rules

### Pricing (credit-cost.ts)

```typescript
// Cost per image generation
export function calculateImageCost(
  quality: 'standard' | 'high',
  count: number = 1
): number {
  const baseCost = quality === 'high' ? 3 : 2
  return baseCost * count
}

// Cost per transformation type
export const TRANSFORMATION_COSTS = {
  depersonalization: 2,
  staging: 2,
  renovation: 3,
  custom: 4,
}

// Bulk discounts (future)
export function applyBulkDiscount(totalCost: number, count: number): number {
  if (count >= 10) return totalCost * 0.9  // 10% off
  if (count >= 50) return totalCost * 0.8  // 20% off
  return totalCost
}
```

### Validation Rules

- ✅ Balance cannot be negative
- ✅ Transaction amounts must be integers
- ✅ Pending transactions must be confirmed or cancelled within 1 hour
- ✅ Refunds cannot exceed original transaction amount

## Ports (Interfaces)

### ICreditsRepository

```typescript
interface ICreditsRepository {
  // Balance queries
  getBalance(userId: string): Promise<number>
  getTransactionHistory(userId: string, options?: PaginationOptions): Promise<CreditTransaction[]>

  // Atomic operations (use SQL functions)
  reserveCredits(userId: string, amount: number, operation: string): Promise<string>
  confirmReservation(reservationId: string, metadata?: TransactionMetadata): Promise<void>
  cancelReservation(reservationId: string): Promise<void>

  // Direct operations (admin only)
  addCredits(userId: string, amount: number, type: string, description: string): Promise<void>

  // Packs
  getCreditPacks(): Promise<CreditPack[]>
}
```

## Architecture Critique: Système de Réservation

### Pourquoi la Réservation?

Les opérations d'IA peuvent échouer. Sans réservation:
- ❌ L'utilisateur est débité mais ne reçoit rien
- ❌ Impossible de refund automatiquement
- ❌ Pas d'audit trail clair

Avec réservation:
- ✅ Crédits réservés immédiatement (atomique)
- ✅ Opération tentée
- ✅ Si succès: confirmation (+ metadata)
- ✅ Si échec: annulation automatique (refund)

### Flux de Réservation

```
┌─────────────────────────────────────────────────────┐
│  1. RESERVE (atomic SQL)                            │
│     - Lock user row (FOR UPDATE)                    │
│     - Check balance >= amount                       │
│     - Deduct credits                                │
│     - Insert transaction (status: PENDING)          │
│     - Return reservation ID                         │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  2. OPERATION                                       │
│     - Generate image                                │
│     - Process payment                               │
│     - etc.                                          │
└─────────────────────────────────────────────────────┘
                         ↓
         ┌───────────────┴───────────────┐
         │ Success?                      │
         ├───────────────┬───────────────┤
         │ YES           │ NO            │
         ↓               ↓
┌────────────────┐  ┌─────────────────┐
│  3a. CONFIRM   │  │  3b. CANCEL     │
│  - Update txn  │  │  - Refund       │
│  - Add metadata│  │  - Delete txn   │
└────────────────┘  └─────────────────┘
```

### SQL Functions (Atomic)

**deduct_user_credits()**: Réserve les crédits de manière atomique

```sql
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT 'Credit deduction'
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the user row to prevent race conditions
  SELECT credits_balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Check if user has enough credits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %',
      p_amount, v_current_balance;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update user balance
  UPDATE users
  SET credits_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    balance_before,
    balance_after,
    transaction_type,
    reference_type,
    reference_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    -p_amount,
    v_current_balance,
    v_new_balance,
    'usage',
    p_reference_type,
    p_reference_id,
    p_description,
    jsonb_build_object('status', 'pending')
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
```

**add_user_credits()**: Ajoute des crédits (pour refund ou purchase)

```sql
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR,
  p_description TEXT,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
-- Similar implementation but adds instead of deducts
$$
```

## Implémentation

### Repository (Supabase)

**Fichier**: [src/infrastructure/supabase/credits.repository.ts](../../../infrastructure/supabase/credits.repository.ts)

**Méthodes critiques**:

```typescript
class SupabaseCreditsRepository implements ICreditsRepository {
  // 1. Reserve credits atomically
  async reserveCredits(userId: string, amount: number, operation: string): Promise<string> {
    const { data, error } = await this.supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reference_type: 'reservation',
      p_reference_id: null,
      p_description: `[PENDING] ${operation}`,
    })

    if (error) throw new Error(`Failed to reserve: ${error.message}`)
    return data // Transaction ID
  }

  // 2. Confirm reservation (update status + metadata)
  async confirmReservation(reservationId: string, metadata?: TransactionMetadata): Promise<void> {
    await this.supabase
      .from('credit_transactions')
      .update({
        description: description.replace('[PENDING] ', ''),
        image_quality: metadata?.imageQuality,
        image_count: metadata?.imageCount,
        metadata: { ...existingMetadata, status: 'confirmed' }
      })
      .eq('id', reservationId)
  }

  // 3. Cancel reservation (refund + delete)
  async cancelReservation(reservationId: string): Promise<void> {
    // Get pending transaction
    const { data: reservation } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (reservation.metadata?.status !== 'pending') return

    // Refund credits
    const amount = Math.abs(reservation.amount)
    await this.supabase.rpc('add_user_credits', {
      p_user_id: reservation.user_id,
      p_amount: amount,
      p_transaction_type: 'refund',
      p_description: `Refund: ${reservation.description}`,
    })

    // Delete pending transaction
    await this.supabase
      .from('credit_transactions')
      .delete()
      .eq('id', reservationId)
  }
}
```

### Middleware: withCredits

**Fichier**: [src/lib/api/middleware/credits.ts](../../../lib/api/middleware/credits.ts)

Wrapper pour API routes consommant des crédits:

```typescript
export function withCredits(
  handler: (request: NextRequest) => Promise<Response>,
  options: {
    creditCost: number
    operation: string
    getMetadata?: (request: NextRequest, response: Response) => TransactionMetadata
  }
) {
  return withAuth(async (request: NextRequest) => {
    const repository = new SupabaseCreditsRepository(supabase)
    let reservationId: string | null = null

    try {
      // 1. Reserve credits (atomic, immediate deduction)
      reservationId = await repository.reserveCredits(
        request.user.id,
        options.creditCost,
        options.operation
      )

      // 2. Execute handler (e.g., generate image)
      const response = await handler(request)

      // 3. Extract metadata from response if provided
      const metadata = options.getMetadata?.(request, response)

      // 4. Confirm reservation (update with metadata)
      await repository.confirmReservation(reservationId, metadata)

      return response
    } catch (error: any) {
      // 5. Auto-cancel on any error (refund)
      if (reservationId) {
        await repository.cancelReservation(reservationId)
      }

      // Handle insufficient credits specifically
      if (error.message.includes('Insufficient credits')) {
        const match = error.message.match(/Required: (\d+), Available: (\d+)/)
        const required = match ? parseInt(match[1]) : options.creditCost
        const available = match ? parseInt(match[2]) : 0

        return NextResponse.json({
          error: 'Insufficient credits',
          message: `You need ${required} credits but only have ${available}`,
          balance: available,
          required,
        }, { status: 402 }) // Payment Required
      }

      throw error
    }
  })
}
```

**Usage dans API route**:

```typescript
// app/api/generate-image/route.ts
export const POST = withCredits(
  async (request) => {
    const body = await request.json()

    // Generate image (can throw error)
    const result = await aiGenerator.generateImage(body)

    return NextResponse.json(result)
  },
  {
    creditCost: 2,
    operation: 'Image generation',
    getMetadata: (req, res) => ({
      imageQuality: req.body.quality,
      imageCount: 1,
      relatedProjectName: req.body.projectName,
    })
  }
)
```

### Hooks React Query

**Fichier**: [src/application/credits/use-credits.ts](../../../application/credits/use-credits.ts)

```typescript
// Get current balance
export function useCreditBalance() {
  return useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: async () => {
      const response = await fetch('/api/credits/balance')
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30s
  })
}

// Get transaction history
export function useCreditTransactions(options?: PaginationOptions) {
  return useQuery({
    queryKey: ['credits', 'transactions', options],
    queryFn: async () => {
      const response = await fetch('/api/credits/transactions')
      return response.json()
    },
  })
}

// Get credit packs
export function useCreditPacks() {
  return useQuery({
    queryKey: ['credits', 'packs'],
    queryFn: async () => {
      const response = await fetch('/api/credits/packs')
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10min (rarely changes)
  })
}
```

## Intégration Stripe

### Purchase Flow

```
[User clicks "Buy"]
     ↓
[POST /api/stripe/checkout]
     ↓
[Create Stripe Session with metadata]
     ↓
[Redirect to Stripe Checkout]
     ↓
[User pays]
     ↓
[Stripe Webhook: checkout.session.completed]
     ↓
[Call add_user_credits() with pack amount]
     ↓
[Redirect to /credits/success]
```

### Webhook Handler

**Fichier**: [app/api/stripe/webhook/route.ts](../../../../app/api/stripe/webhook/route.ts)

```typescript
case 'checkout.session.completed':
  const session = event.data.object
  const userId = session.metadata.userId
  const packId = session.metadata.packId

  // Get pack details
  const pack = CREDIT_PACKS.find(p => p.id === packId)

  // Add credits atomically
  await repository.addCredits(
    userId,
    pack.credits,
    'purchase',
    `Purchased ${pack.name} pack`,
    {
      stripeSessionId: session.id,
      stripePriceId: pack.stripePriceId,
    }
  )

  // Invalidate balance cache
  // (client will auto-refetch)
```

## Security

### CRITICAL: Atomic Operations

**❌ NEVER do this** (race condition):

```typescript
// Bad: Race condition possible
const balance = await getBalance(userId)
if (balance >= cost) {
  await updateBalance(userId, balance - cost)  // ⚠️ Another request could interleave here!
}
```

**✅ ALWAYS use SQL functions**:

```typescript
// Good: Atomic operation
await supabase.rpc('deduct_user_credits', { ... })
// SQL locks the row with FOR UPDATE
```

### Idempotency

Stripe webhooks peuvent être envoyés plusieurs fois. **Toujours** vérifier:

```typescript
// Check if transaction already exists
const existing = await repository.getTransactionByStripeSessionId(sessionId)
if (existing) {
  logger.info('Transaction already processed', { sessionId })
  return // Skip
}
```

### Audit Trail

Chaque transaction doit avoir:
- ✅ User ID
- ✅ Amount (signed: + or -)
- ✅ Balance before/after
- ✅ Type (purchase/usage/refund)
- ✅ Description
- ✅ Metadata (context)
- ✅ Timestamp

## Testing

### Unit Tests

```typescript
describe('calculateImageCost', () => {
  it('should calculate standard quality cost', () => {
    expect(calculateImageCost('standard', 1)).toBe(2)
    expect(calculateImageCost('standard', 5)).toBe(10)
  })

  it('should calculate high quality cost', () => {
    expect(calculateImageCost('high', 1)).toBe(3)
  })
})
```

### Integration Tests

```typescript
describe('Credit Reservation System', () => {
  it('should reserve and confirm credits', async () => {
    // Given: User with 10 credits
    const userId = await createTestUser({ credits: 10 })

    // When: Reserve 3 credits
    const reservationId = await repository.reserveCredits(userId, 3, 'test')

    // Then: Balance should be 7
    expect(await repository.getBalance(userId)).toBe(7)

    // When: Confirm reservation
    await repository.confirmReservation(reservationId)

    // Then: Balance stays 7 (no double deduction)
    expect(await repository.getBalance(userId)).toBe(7)
  })

  it('should refund on cancel', async () => {
    const userId = await createTestUser({ credits: 10 })
    const reservationId = await repository.reserveCredits(userId, 3, 'test')

    // Cancel reservation
    await repository.cancelReservation(reservationId)

    // Credits refunded
    expect(await repository.getBalance(userId)).toBe(10)
  })

  it('should prevent negative balance', async () => {
    const userId = await createTestUser({ credits: 1 })

    // Try to reserve 5 credits
    await expect(
      repository.reserveCredits(userId, 5, 'test')
    ).rejects.toThrow('Insufficient credits')
  })
})
```

## Common Issues

### Issue: Balance not updating in UI

**Cause**: React Query cache not invalidated

**Solution**: Invalidate after mutation

```typescript
const generateImage = useMutation({
  mutationFn: generateImageApi,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['credits', 'balance'] })
  },
})
```

### Issue: Double deduction

**Cause**: Calling `deduct_user_credits()` twice

**Solution**: Use reservation system (reserve once, confirm)

### Issue: Credits not added after payment

**Cause**: Webhook not received or failed

**Solution**:
1. Check Stripe Dashboard > Webhooks > Events
2. Verify webhook signature
3. Check logs for errors
4. Manual credit adjustment if needed

## Monitoring

### Metrics to Track

- Balance updates per user
- Failed reservations (insufficient credits)
- Cancelled reservations (operation failures)
- Average transaction value
- Total credits purchased vs. used

### Alerts

- 🚨 Negative balance (should never happen!)
- ⚠️ High cancellation rate (>10%)
- ⚠️ Webhook failures
- ⚠️ Reservation not confirmed/cancelled within 1h

## Resources

- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Row Locking](https://www.postgresql.org/docs/current/explicit-locking.html)

---

**CRITICAL DOMAIN - Handle with care!**

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
