"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSignIn } from "@/domain/auth";
import { AuthCard, LoginForm } from "@/components/auth";
import Link from "next/link";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const signInMutation = useSignIn();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      const result = await signInMutation.mutateAsync(data);

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
    }
  };

  const handleGoogleSignIn = async () => {
    toast.info("Fonctionnalité Google OAuth à implémenter");
  };

  return (
    <AuthCard
      title="Bon retour !"
      subtitle="Connectez-vous à votre compte pour continuer"
    >
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={signInMutation.isPending}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthCard
        title="Bon retour !"
        subtitle="Connectez-vous à votre compte pour continuer"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">Chargement...</div>
        </div>
      </AuthCard>
    }>
      <LoginContent />
    </Suspense>
  );
}
