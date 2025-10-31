import { create } from 'zustand';
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

  // Actions
  fetchBalance: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  refreshCredits: (userId: string) => Promise<void>;
}

export const useCreditsStore = create<CreditsStore>((set) => ({
  balance: 0,
  stats: null,
  isLoading: false,
  error: null,

  fetchBalance: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Récupérer le solde depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits_remaining')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      set({
        balance: userData?.credits_remaining || 0,
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[CreditsStore] Error fetching balance:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();

      // Appeler la fonction RPC pour les stats
      const { data, error } = await supabase
        .rpc('get_user_credit_stats', { p_user_id: userId });

      if (error) throw error;

      set({
        stats: {
          balance: data.balance || 0,
          totalEarned: data.total_earned || 0,
          totalSpent: data.total_spent || 0,
        },
        balance: data.balance || 0,
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[CreditsStore] Error fetching stats:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  refreshCredits: async (userId: string) => {
    // Rafraîchir à la fois le solde et les stats
    await Promise.all([
      useCreditsStore.getState().fetchBalance(userId),
      useCreditsStore.getState().fetchStats(userId),
    ]);
  },
}));
