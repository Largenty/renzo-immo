/**
 * Auth Store Provider - Version simplifiée
 * Initialise le store d'authentification une seule fois au démarrage
 */

'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // S'assurer qu'on initialise une seule fois
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('[AuthStoreProvider] Initializing auth...');
      useAuthStore.getState().initAuth();
    }
  }, []);

  return <>{children}</>;
}
