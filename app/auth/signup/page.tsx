"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSignUp } from "@/domain/auth";
import { AuthCard, SignupForm, type SignupFormData } from "@/components/auth";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const signUpMutation = useSignUp();

  const handleSubmit = async (data: SignupFormData) => {
    // Validation
    if (data.password !== data.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // ✅ Validation mot de passe conforme au serveur (12 caractères + complexité)
    if (data.password.length < 12) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins 12 caractères",
      });
      return;
    }

    // Vérifier la complexité
    if (!/[a-z]/.test(data.password)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins une minuscule",
      });
      return;
    }

    if (!/[A-Z]/.test(data.password)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins une majuscule",
      });
      return;
    }

    if (!/[0-9]/.test(data.password)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins un chiffre",
      });
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(data.password)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)",
      });
      return;
    }

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
    }
  };

  const handleGoogleSignIn = async () => {
    toast.info("Fonctionnalité Google OAuth à implémenter");
  };

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Transformez vos photos immobilières avec l'IA"
    >
      <SignupForm
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
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
