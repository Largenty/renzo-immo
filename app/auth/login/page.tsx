"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useCallback, Suspense } from "react";
import { toast } from "sonner";
import { useSignIn } from "@/domain/auth";
import { AuthCard, LoginForm, AuthLoading } from "@/components/auth";
import Link from "next/link";
import { isValidRedirectPath } from "@/lib/api/helpers";
import { AUTH_ERROR_MESSAGES } from "@/lib/constants/auth-errors";
import { useGoogleAuth } from "@/hooks/use-google-auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo") || "/dashboard";
  const errorParam = searchParams.get("error");
  const signInMutation = useSignIn();

  // ✅ SECURITY: Valider le chemin de redirection
  const redirectTo = isValidRedirectPath(rawRedirectTo)
    ? rawRedirectTo
    : "/dashboard";

  // ✅ OPTIMIZATION: Use custom hook for Google auth
  const { signInWithGoogle } = useGoogleAuth();

  // ✅ Gestion des erreurs du callback OAuth
  useEffect(() => {
    if (errorParam) {
      const message =
        AUTH_ERROR_MESSAGES[errorParam as keyof typeof AUTH_ERROR_MESSAGES] ||
        "Une erreur est survenue lors de la connexion.";
      toast.error("Erreur de connexion", { description: message });
    }
  }, [errorParam]);

  const handleSubmit = useCallback(async (data: { email: string; password: string }) => {
    try {
      const result = await signInMutation.mutateAsync(data);

      if (result.success) {
        toast.success("Connexion réussie !");
        // Redirection SPA avec refresh des Server Components
        router.push(redirectTo);
        router.refresh();
      } else {
        toast.error("Erreur de connexion", {
          description: result.error || "Email ou mot de passe incorrect",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la connexion",
      });
    }
  }, [signInMutation, router, redirectTo]);


  return (
    <AuthCard
      title="Bon retour !"
      subtitle="Connectez-vous à votre compte pour continuer"
    >
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleSignIn={signInWithGoogle}
        isLoading={signInMutation.isPending}
      />

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Bon retour !"
          subtitle="Connectez-vous à votre compte pour continuer"
        />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
