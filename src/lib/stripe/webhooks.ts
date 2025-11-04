import { stripe } from './stripe';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    logger.error('[Stripe Webhook] Signature verification failed', { error });
    throw error;
  }
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_events')
    .select('id, processed')
    .eq('stripe_event_id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is fine
    logger.error('[Stripe Webhook] Error checking event', { error, eventId });
    throw error;
  }

  return data?.processed === true;
}

/**
 * Mark webhook event as processed
 */
export async function markEventAsProcessed(
  eventId: string,
  eventType: string,
  payload: Stripe.Event
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('stripe_events').upsert(
    {
      stripe_event_id: eventId,
      event_type: eventType,
      processed: true,
      processed_at: new Date().toISOString(),
      payload: payload as any,
    },
    {
      onConflict: 'stripe_event_id',
    }
  );

  if (error) {
    logger.error('[Stripe Webhook] Error marking event as processed', {
      error,
      eventId,
    });
    throw error;
  }
}

/**
 * Mark webhook event as failed
 */
export async function markEventAsFailed(
  eventId: string,
  eventType: string,
  errorMessage: string,
  payload: Stripe.Event
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('stripe_events').upsert(
    {
      stripe_event_id: eventId,
      event_type: eventType,
      processed: false,
      error_message: errorMessage,
      retry_count: 1, // Will be incremented in subsequent failures
      payload: payload as any,
    },
    {
      onConflict: 'stripe_event_id',
    }
  );

  if (error) {
    logger.error('[Stripe Webhook] Error marking event as failed', {
      error,
      eventId,
    });
  }
}

/**
 * Handle checkout.session.completed event
 * This is triggered when a payment is successful
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const supabase = await createClient();

  logger.info('[Stripe Webhook] Processing checkout.session.completed', {
    sessionId: session.id,
    metadata: session.metadata,
  });

  const userId = session.metadata?.userId;
  const creditPackId = session.metadata?.creditPackId;
  const paymentIntentId = session.payment_intent as string;

  if (!userId || !creditPackId) {
    throw new Error('Missing userId or creditPackId in session metadata');
  }

  // Get credit pack details
  const { data: creditPack, error: packError } = await supabase
    .from('credit_packs')
    .select('*')
    .eq('id', creditPackId)
    .single();

  if (packError || !creditPack) {
    throw new Error(`Credit pack not found: ${creditPackId}`);
  }

  // Add credits to user using database function
  const { error: creditsError } = await supabase.rpc('add_user_credits', {
    p_user_id: userId,
    p_amount: creditPack.credits,
    p_transaction_type: 'purchase',
    p_description: `Achat de ${creditPack.credits} crédits - ${creditPack.name}`,
    p_credit_pack_id: creditPackId,
    p_stripe_payment_intent_id: paymentIntentId,
    p_stripe_checkout_session_id: session.id,
  });

  if (creditsError) {
    logger.error('[Stripe Webhook] Failed to add credits', {
      error: creditsError,
      userId,
      creditPackId,
    });
    throw creditsError;
  }

  logger.info('[Stripe Webhook] Credits added successfully', {
    userId,
    credits: creditPack.credits,
    packName: creditPack.name,
  });
}

/**
 * Handle payment_intent.payment_failed event
 */
export async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  logger.warn('[Stripe Webhook] Payment failed', {
    paymentIntentId: paymentIntent.id,
    metadata: paymentIntent.metadata,
  });

  // TODO: Optionally notify user via email or in-app notification
  // For now, just log it
}

/**
 * Handle charge.refunded event
 */
export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const supabase = await createClient();

  logger.info('[Stripe Webhook] Processing charge.refunded', {
    chargeId: charge.id,
    amount: charge.amount_refunded,
  });

  // Find the original transaction
  const { data: transaction, error: txError } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('stripe_payment_intent_id', charge.payment_intent)
    .eq('transaction_type', 'purchase')
    .single();

  if (txError || !transaction) {
    logger.error('[Stripe Webhook] Original transaction not found', {
      paymentIntentId: charge.payment_intent,
    });
    throw new Error('Original transaction not found');
  }

  // Deduct the refunded credits
  const { error: refundError } = await supabase.rpc('add_user_credits', {
    p_user_id: transaction.user_id,
    p_amount: -transaction.amount, // Negative to deduct
    p_transaction_type: 'refund',
    p_description: `Remboursement - ${transaction.description}`,
    p_stripe_payment_intent_id: charge.payment_intent as string,
    p_reference_type: 'transaction',
    p_reference_id: transaction.id,
  });

  if (refundError) {
    logger.error('[Stripe Webhook] Failed to process refund', {
      error: refundError,
      transactionId: transaction.id,
    });
    throw refundError;
  }

  logger.info('[Stripe Webhook] Refund processed successfully', {
    userId: transaction.user_id,
    refundedCredits: transaction.amount,
  });
}
