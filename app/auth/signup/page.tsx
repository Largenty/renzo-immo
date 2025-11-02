"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback, Suspense } from "react";
import { toast } from "sonner";
import { useSignUp } from "@/domain/auth";
import { AuthCard, SignupForm, type SignupFormData, AuthLoading } from "@/components/auth";
import Link from "next/link";
import { validatePassword } from "@/lib/validators/password-validator";
import { AUTH_ERROR_MESSAGES } from "@/lib/constants/auth-errors";
import { useGoogleAuth } from "@/hooks/use-google-auth";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signUpMutation = useSignUp();
  const errorParam = searchParams.get("error");

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

  const handleSubmit = useCallback(async (data: SignupFormData) => {
    // Validation: mots de passe correspondent
    if (data.password !== data.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // ✅ Validation mot de passe avec le validateur centralisé
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      // Afficher toutes les erreurs de validation
      const firstError = passwordValidation.errors[0];
      toast.error("Erreur de validation", {
        description: firstError || "Le mot de passe ne respecte pas les critères de sécurité",
      });
      return;
    }

    // Validation: conditions d'utilisation
    if (!data.acceptTerms) {
      toast.error("Erreur", {
        description: "Vous devez accepter les conditions d'utilisation",
      });
      return;
    }

    try {
      const result = await signUpMutation.mutateAsync({
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
        // Redirection après un court délai pour laisser l'utilisateur voir le message
        setTimeout(() => {
          router.push("/auth/login?verified=pending");
        }, 2000);
      } else {
        toast.error("Erreur lors de l'inscription", {
          description: result.error || "Une erreur est survenue",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'inscription",
      });
    }
  }, [signUpMutation, router]);


  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Transformez vos photos immobilières avec l'IA"
    >
      <SignupForm
        onSubmit={handleSubmit}
        onGoogleSignIn={signInWithGoogle}
        isLoading={signUpMutation.isPending}
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
