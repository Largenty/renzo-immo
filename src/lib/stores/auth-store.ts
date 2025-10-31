import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

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
  isInitialized: boolean;

  // Actions
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearUser: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,

  checkAuth: async () => {
    if (get().isInitialized) {
      logger.debug('[AuthStore] Already initialized, skipping...');
      return; // Déjà vérifié
    }

    try {
      logger.debug('[AuthStore] Checking auth...');
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('[AuthStore] Session error:', sessionError);
        set({
          user: null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      logger.debug('[AuthStore] Session:', session ? 'found' : 'not found');

      if (session?.user) {
        logger.debug('[AuthStore] Fetching user data for:', session.user.id);

        // Récupérer les infos complètes de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          logger.error('[AuthStore] User data error:', userError);
        }

        logger.debug('[AuthStore] User data:', userData ? 'found' : 'not found');

        set({
          user: userData ? {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            avatarUrl: userData.avatar_url,
            phone: userData.phone,
            company: userData.company,
            address: userData.address,
          } : null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        logger.debug('[AuthStore] No session, setting user to null');
        set({
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      logger.error('[AuthStore] Unexpected error in checkAuth:', error);
      set({
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  setUser: (user) => {
    set({ user, isLoading: false, isInitialized: true });
  },

  updateUser: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({ isLoading: true });

    try {
      const supabase = createClient();
      const updateData: any = {};

      if (data.firstName !== undefined) updateData.first_name = data.firstName;
      if (data.lastName !== undefined) updateData.last_name = data.lastName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.company !== undefined) updateData.company = data.company;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Mettre à jour le store
      set({
        user: { ...currentUser, ...data },
        isLoading: false,
      });
    } catch (error: any) {
      logger.error('[AuthStore] Error updating user:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  clearUser: () => {
    set({ user: null, isLoading: false });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
}));
