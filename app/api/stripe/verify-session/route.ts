import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/stripe/verify-session
 * Vérifie qu'une session Stripe a bien été payée
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Vérifier le statut du paiement
    if (session.payment_status === 'paid') {
      // Extraire le montant de crédits depuis les métadonnées ou line items
      let creditsAmount = 0;

      // Méthode 1: Depuis les métadonnées de la session
      if (session.metadata?.credits) {
        creditsAmount = parseInt(session.metadata.credits, 10);
      }
      // Méthode 2: Depuis les line items
      else if (session.line_items?.data?.[0]?.description) {
        const match = session.line_items.data[0].description.match(/(\d+)\s+crédits?/i);
        if (match) {
          creditsAmount = parseInt(match[1], 10);
        }
      }

      return NextResponse.json({
        success: true,
        amount: creditsAmount,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
    }

    return NextResponse.json({
      success: false,
      paymentStatus: session.payment_status,
      message: 'Le paiement n\'est pas confirmé',
    });
  } catch (error) {
    console.error('Error verifying Stripe session:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Erreur Stripe: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la session' },
      { status: 500 }
    );
  }
}
