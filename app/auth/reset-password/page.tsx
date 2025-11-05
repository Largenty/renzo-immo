"use client";

import { Suspense } from "react";
import { AuthCard, ResetPasswordForm, AuthLoading } from "@/modules/auth";
import Link from "next/link";

function ResetPasswordContent() {
  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe fort et sécurisé"
    >
      <ResetPasswordForm />

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Réinitialisation"
          subtitle="Chargement..."
        />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
