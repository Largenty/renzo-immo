import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  verifyWebhookSignature,
  isEventProcessed,
  markEventAsProcessed,
  markEventAsFailed,
  handleCheckoutSessionCompleted,
  handlePaymentFailed,
  handleChargeRefunded,
} from '@/modules/billing/api';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * 🔒 SECURITY: Webhook signature verification ensures requests come from Stripe
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('[POST /api/stripe/webhook] No signature provided');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      logger.error('[POST /api/stripe/webhook] Signature verification failed', {
        error,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    logger.info('[POST /api/stripe/webhook] Event received', {
      eventId: event.id,
      eventType: event.type,
    });

    // Check if event already processed (idempotency)
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      logger.info('[POST /api/stripe/webhook] Event already processed', {
        eventId: event.id,
      });
      return NextResponse.json({ received: true });
    }

    // Handle different event types
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(session);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentFailed(paymentIntent);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          await handleChargeRefunded(charge);
          break;
        }

        // Add more event types as needed
        default:
          logger.info('[POST /api/stripe/webhook] Unhandled event type', {
            eventType: event.type,
          });
      }

      // Mark event as processed
      await markEventAsProcessed(event.id, event.type, event);

      return NextResponse.json({ received: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      logger.error('[POST /api/stripe/webhook] Event processing failed', {
        error,
        eventId: event.id,
        eventType: event.type,
      });

      // Mark event as failed
      await markEventAsFailed(event.id, event.type, errorMessage, event);

      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: 'Event processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('[POST /api/stripe/webhook] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
