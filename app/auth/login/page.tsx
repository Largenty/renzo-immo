"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn, signInWithGoogle } from "@/lib/auth/actions";
import { AuthCard, LoginForm } from "@/components/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);

    try {
      const result = await signIn(data);

      if (result.success) {
        toast.success("Connexion réussie !", {
          description: "Bienvenue sur Renzo",
        });
        router.push(redirectTo);
      } else {
        toast.error("Erreur de connexion", {
          description: result.error || "Email ou mot de passe incorrect",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la connexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      if (!result.success && result.error) {
        toast.error("Erreur Google", {
          description: result.error,
        });
      }
      // Si succès, on sera redirigé vers Google OAuth
    } catch {
      toast.error("Erreur", {
        description: "Impossible de se connecter avec Google",
      });
    }
  };

  return (
    <AuthCard
      title="Bon retour !"
      subtitle="Connectez-vous à votre compte pour continuer"
    >
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
      />

      {/* Back to home */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </AuthCard>
  );
}
