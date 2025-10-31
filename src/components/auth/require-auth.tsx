"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/domain/auth";
import { logger } from '@/lib/logger';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export function RequireAuth({ children, redirectTo = "/auth/login" }: RequireAuthProps) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user && !isRedirecting) {
      logger.debug("[RequireAuth] No user found, redirecting to:", redirectTo);
      setIsRedirecting(true);
      // Use window.location for a hard redirect
      window.location.href = redirectTo;
    }
  }, [user, isLoading, redirectTo, isRedirecting]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // If error or no user, show redirecting message
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
