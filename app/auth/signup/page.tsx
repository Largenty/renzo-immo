"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp, signInWithGoogle } from "@/lib/auth/actions";
import { AuthCard, SignupForm, type SignupFormData } from "@/components/auth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SignupFormData) => {
    // Validation
    if (data.password !== data.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    if (data.password.length < 8) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }

    if (!data.acceptTerms) {
      toast.error("Erreur", {
        description: "Vous devez accepter les conditions d'utilisation",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || undefined,
      });

      if (result.success) {
        toast.success("Compte créé avec succès !", {
          description: result.message || "Vérifiez votre email pour confirmer votre compte",
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast.error("Erreur lors de l'inscription", {
          description: result.error || "Une erreur est survenue",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'inscription",
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
    } catch {
      toast.error("Erreur", {
        description: "Impossible de se connecter avec Google",
      });
    }
  };

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Transformez vos photos immobilières avec l'IA"
    >
      <SignupForm
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
      />

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
