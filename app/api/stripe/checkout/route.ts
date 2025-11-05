import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/modules/billing/api/checkout';
import { logger } from '@/lib/logger';
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

/**
 * Handler for creating Stripe checkout session
 * ✅ Auth handled by middleware
 */
async function createCheckoutHandler(request: AuthenticatedRequest) {
  try {
    const { user, supabase } = request;

    // Parse request body
    const body = await request.json();
    const { creditPackId } = body;

    if (!creditPackId) {
      return NextResponse.json(
        { error: 'creditPackId is required' },
        { status: 400 }
      );
    }

    // Get credit pack details
    const { data: creditPack, error: packError } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('id', creditPackId)
      .eq('is_active', true)
      .single();

    if (packError || !creditPack) {
      logger.error('[POST /api/stripe/checkout] Credit pack not found', {
        creditPackId,
        error: packError,
      });
      return NextResponse.json(
        { error: 'Credit pack not found or inactive' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      priceId: creditPack.stripe_price_id,
      creditPackId: creditPack.id,
      successUrl: `${appUrl}/dashboard/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/dashboard/credits?canceled=true`,
    });

    logger.info('[POST /api/stripe/checkout] Checkout session created', {
      userId: user.id,
      sessionId: session.id,
      creditPackId,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error('[POST /api/stripe/checkout] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/checkout
 * ✅ Protected by auth middleware
 */
export const POST = withAuth(createCheckoutHandler);
