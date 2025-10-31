'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Initialiser le store une seule fois au démarrage de l'app
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
