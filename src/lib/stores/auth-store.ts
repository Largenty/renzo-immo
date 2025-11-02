/**
 * Auth Store - Version simplifiée
 * Gère l'état de l'utilisateur côté client
 */

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;

  // Actions
  initAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  /**
   * Initialiser l'authentification
   * À appeler une seule fois au démarrage de l'app
   */
  initAuth: async () => {
    try {
      console.log('[AuthStore] Initializing auth...');
      console.log('[AuthStore] Creating Supabase client...');
      const supabase = createClient();
      console.log('[AuthStore] Supabase client created');

      // Récupérer l'utilisateur (plus fiable que getSession côté client)
      console.log('[AuthStore] Calling getUser()...');
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      console.log('[AuthStore] getUser() response received:', { hasUser: !!authUser, hasError: !!error });

      if (error) {
        console.error('[AuthStore] Auth error:', error);
        set({ user: null, isLoading: false });
        return;
      }

      if (!authUser) {
        console.log('[AuthStore] No user found');
        set({ user: null, isLoading: false });
        return;
      }

      console.log('[AuthStore] User found, fetching user data from DB...');

      // Récupérer les données utilisateur depuis la DB
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, avatar_url, phone, company, address')
        .eq('id', authUser.id)
        .single();

      console.log('[AuthStore] DB query result:', { hasData: !!userData, hasError: !!userError });

      if (userError) {
        console.error('[AuthStore] User fetch error:', userError);
        set({ user: null, isLoading: false });
        return;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.avatar_url,
        phone: userData.phone,
        company: userData.company,
        address: userData.address,
      };

      console.log('[AuthStore] User loaded:', user.id);
      set({ user, isLoading: false });

      // Écouter les changements d'authentification
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AuthStore] Auth state changed:', event);

        if (event === 'SIGNED_OUT') {
          set({ user: null });
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Recharger les données utilisateur
          const { data } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, avatar_url, phone, company, address')
            .eq('id', session.user.id)
            .single();

          if (data) {
            set({
              user: {
                id: data.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                avatarUrl: data.avatar_url,
                phone: data.phone,
                company: data.company,
                address: data.address,
              },
            });
          }
        }
      });
    } catch (error) {
      console.error('[AuthStore] Init error:', error);
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isLoading: false });
  },

  clearUser: () => {
    set({ user: null });
  },
}));
