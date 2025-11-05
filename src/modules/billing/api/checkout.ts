import { stripe } from './stripe';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  priceId: string;
  creditPackId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout Session for purchasing credits
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { userId, userEmail, priceId, creditPackId, successUrl, cancelUrl } = params;

  try {
    logger.info('[Stripe Checkout] Creating session', {
      userId,
      priceId,
      creditPackId,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        creditPackId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'auto',
      // Allow promotion codes
      allow_promotion_codes: true,
      // Expires after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    logger.info('[Stripe Checkout] Session created', {
      sessionId: session.id,
      userId,
    });

    return session;
  } catch (error) {
    logger.error('[Stripe Checkout] Failed to create session', {
      error,
      userId,
      priceId,
    });
    throw error;
  }
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    return session;
  } catch (error) {
    logger.error('[Stripe Checkout] Failed to retrieve session', {
      error,
      sessionId,
    });
    throw error;
  }
}

/**
 * Create a customer portal session (for viewing invoices, updating payment methods)
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    logger.error('[Stripe Portal] Failed to create session', {
      error,
      customerId,
    });
    throw error;
  }
}
