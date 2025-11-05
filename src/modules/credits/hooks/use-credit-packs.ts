/**
 * React Hook pour récupérer les packs de crédits
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import type { CreditPack, CreditPackDTO } from '@/modules/credits';
import { fromCreditPackDTO } from '@/modules/credits';

/**
 * Hook : Récupérer les packs de crédits disponibles
 */
export function useCreditPacks() {
  return useQuery({
    queryKey: ['credit-packs'],
    queryFn: async (): Promise<CreditPack[]> => {
      try {
        const response = await fetch('/api/credits/packs');

        if (!response.ok) {
          throw new Error(`Failed to fetch credit packs: ${response.statusText}`);
        }

        const data = await response.json();
        const packs: CreditPackDTO[] = data.packs || [];

        // Mapper vers le format CreditPack
        return packs.map(fromCreditPackDTO);
      } catch (error) {
        logger.error('[useCreditPacks] Error fetching credit packs', { error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (packs changent rarement)
    retry: 2,
  });
}
