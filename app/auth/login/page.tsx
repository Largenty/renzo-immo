"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, LoginForm, AuthLoading } from "@/modules/auth";
import Link from "next/link";
import { AUTH_ERROR_MESSAGES } from "@/lib/constants/auth-errors";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  // ✅ Gestion des erreurs du callback OAuth
  useEffect(() => {
    if (errorParam) {
      const message =
        AUTH_ERROR_MESSAGES[errorParam as keyof typeof AUTH_ERROR_MESSAGES] ||
        "Une erreur est survenue lors de la connexion.";
      toast.error("Erreur de connexion", { description: message });
    }
  }, [errorParam]);

  return (
    <AuthCard
      title="Bon retour !"
      subtitle="Connectez-vous à votre compte pour continuer"
    >
      <LoginForm />

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
