/**
 * React Hook pour acheter des crédits via Stripe
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface PurchaseCreditsParams {
  creditPackId: string;
}

interface PurchaseCreditsResponse {
  sessionId: string;
  url: string;
}

/**
 * Hook : Acheter des crédits
 * Crée une session Stripe Checkout et redirige l'utilisateur
 */
export function usePurchaseCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PurchaseCreditsParams): Promise<PurchaseCreditsResponse> => {
      try {
        logger.info('[usePurchaseCredits] Creating checkout session', params);

        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creditPackId: params.creditPackId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create checkout session');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        logger.error('[usePurchaseCredits] Error creating checkout session', { error });
        throw error;
      }
    },
    onSuccess: async (data) => {
      logger.info('[usePurchaseCredits] Checkout session created', {
        sessionId: data.sessionId,
      });

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      logger.error('[usePurchaseCredits] Purchase failed', { error });
      toast.error('Erreur lors de la création de la session de paiement', {
        description:
          error instanceof Error ? error.message : 'Impossible de créer la session',
      });
    },
    onSettled: () => {
      // Invalidate credit balance to refresh it when user returns
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
    },
  });
}
