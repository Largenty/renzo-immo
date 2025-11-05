"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, SignupForm, AuthLoading } from "@/modules/auth";
import Link from "next/link";
import { AUTH_ERROR_MESSAGES } from "@/lib/constants/auth-errors";

function SignupContent() {
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
      title="Créer un compte"
      subtitle="Transformez vos photos immobilières avec l'IA"
    >
      <SignupForm />

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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Créer un compte"
          subtitle="Transformez vos photos immobilières avec l'IA"
        />
      }
    >
      <SignupContent />
    </Suspense>
  );
}
