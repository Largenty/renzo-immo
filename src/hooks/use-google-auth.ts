/**
 * Custom Hook for Google OAuth Authentication
 * Centralizes Google sign-in logic to avoid duplication between login and signup pages
 */

import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SupabaseAuthProvider } from "@/infra/adapters/auth-provider.supabase";
import { SupabaseUsersRepository } from "@/infra/adapters/users-repository.supabase";
import { AuthenticateService } from "@/domain/auth/services/authenticate";

export function useGoogleAuth() {
  // ✅ OPTIMIZATION: Create authentication service once
  const authenticateService = useMemo(() => {
    const supabase = createClient();
    const authProvider = new SupabaseAuthProvider(supabase);
    const usersRepository = new SupabaseUsersRepository(supabase);
    return new AuthenticateService(authProvider, usersRepository);
  }, []);

  /**
   * Initiates Google OAuth sign-in flow
   * Redirects to Google for authentication
   *
   * @throws Error if sign-in fails
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await authenticateService.signInWithGoogle();

      if (result.success && result.message) {
        // result.message contains the OAuth redirect URL
        // Full page reload is necessary for OAuth callback
        window.location.href = result.message;
      } else {
        toast.error("Erreur", {
          description:
            result.error || "Impossible de démarrer la connexion Google",
        });
        throw new Error(result.error || "Connexion Google échouée");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la connexion Google",
      });
      throw error;
    }
  }, [authenticateService]);

  return { signInWithGoogle };
}
