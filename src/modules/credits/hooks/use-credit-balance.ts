/**
 * React Hook pour récupérer le solde de crédits de l'utilisateur
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

/**
 * Hook : Récupérer le solde de crédits de l'utilisateur connecté
 */
export function useCreditBalance() {
  return useQuery({
    queryKey: ['credit-balance'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetch('/api/credits/balance');

        if (!response.ok) {
          if (response.status === 401) {
            // User not authenticated
            return 0;
          }
          throw new Error(`Failed to fetch credit balance: ${response.statusText}`);
        }

        const data = await response.json();
        return data.credits || 0;
      } catch (error) {
        logger.error('[useCreditBalance] Error fetching credit balance', { error });
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds (balance changes frequently)
    retry: 2,
  });
}
