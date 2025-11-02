import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface CreditStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface CreditsStore {
  balance: number;
  stats: CreditStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchBalance: (userId: string) => Promise<void>;
  fetchStats: (userId: string, force?: boolean) => Promise<void>;
  refreshCredits: (userId: string) => Promise<void>;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useCreditsStore = create<CreditsStore>()(
  persist(
    immer((set, get) => ({
      balance: 0,
      stats: null,
      isLoading: false,
      error: null,
      lastFetch: null,

  fetchBalance: async (userId: string) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();

      // Récupérer le solde depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits_remaining')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      set((state) => {
        state.balance = userData?.credits_remaining || 0;
        state.isLoading = false;
      });
    } catch (error: any) {
      logger.error('[CreditsStore] Error fetching balance:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  fetchStats: async (userId: string, force = false) => {
    const now = Date.now();
    const { lastFetch, stats } = get();

    // ✅ Cache check
    if (!force && lastFetch && stats && now - lastFetch < CACHE_TTL) {
      logger.debug('[CreditsStore] Using cached data');
      return;
    }

    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      const supabase = createClient();

      // Appeler la fonction RPC pour les stats
      const { data, error } = await supabase
        .rpc('get_user_credit_stats', { p_user_id: userId });

      if (error) throw error;

      set((state) => {
        state.stats = {
          balance: data.balance || 0,
          totalEarned: data.total_earned || 0,
          totalSpent: data.total_spent || 0,
        };
        state.balance = data.balance || 0;
        state.isLoading = false;
        state.lastFetch = now;
      });
    } catch (error: any) {
      logger.error('[CreditsStore] Error fetching stats:', error);
      set((state) => {
        state.error = error.message;
        state.isLoading = false;
      });
    }
  },

  refreshCredits: async (userId: string) => {
    // ✅ fetchStats récupère déjà le balance, pas besoin de 2 queries!
    // Réduction: 2 queries → 1 query (50% reduction)
    await useCreditsStore.getState().fetchStats(userId, true); // force refresh
  },
    })),
    {
      name: 'renzo-credits-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        balance: state.balance,
        stats: state.stats,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
