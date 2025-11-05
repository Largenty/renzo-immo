"use client";

import { Suspense } from "react";
import { AuthCard, ForgotPasswordForm, AuthLoading } from "@/modules/auth";
import Link from "next/link";

function ForgotPasswordContent() {
  return (
    <AuthCard
      title="Mot de passe oublié ?"
      subtitle="Nous allons vous envoyer un lien de réinitialisation"
    >
      <ForgotPasswordForm />

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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Mot de passe oublié ?"
          subtitle="Chargement..."
        />
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
