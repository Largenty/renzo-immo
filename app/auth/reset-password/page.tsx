"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, AuthLoading } from "@/presentation/features/auth";
import { Button } from "@/presentation/shared/ui/button";
import { Input } from "@/presentation/shared/ui/input";
import { Label } from "@/presentation/shared/ui/label";
import { CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/validators/password-validator";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);

  // Vérifier si le lien de réinitialisation est valide
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setIsValidLink(false);
        toast.error("Lien invalide", {
          description: "Le lien de réinitialisation est invalide ou a expiré",
        });
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: mots de passe correspondent
    if (password !== confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // Validation: force du mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      const firstError = passwordValidation.errors[0];
      toast.error("Erreur de validation", {
        description: firstError || "Le mot de passe ne respecte pas les critères de sécurité",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error("Erreur", {
          description: error.message || "Impossible de réinitialiser le mot de passe",
        });
      } else {
        setResetSuccess(true);
        toast.success("Mot de passe réinitialisé !", {
          description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
        });

        // Redirection après 2 secondes
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, router]);

  if (!isValidLink) {
    return (
      <AuthCard
        title="Lien invalide"
        subtitle="Le lien de réinitialisation n'est plus valide"
      >
        <div className="space-y-6">
          <div className="py-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Lien expiré ou invalide
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Le lien de réinitialisation a expiré ou a déjà été utilisé. Veuillez demander un nouveau lien.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Demander un nouveau lien
            </Button>

            <Button
              onClick={() => router.push("/auth/login")}
              variant="ghost"
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  if (resetSuccess) {
    return (
      <AuthCard
        title="Mot de passe réinitialisé !"
        subtitle="Vous pouvez maintenant vous connecter"
      >
        <div className="space-y-6">
          <div className="py-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Succès !
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
          </div>

          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            Se connecter maintenant
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe fort et sécurisé"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {/* Password requirements */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="mb-2 text-sm font-medium text-slate-700">
            Critères de sécurité :
          </p>
          <ul className="space-y-1 text-xs text-slate-600">
            <li>• Minimum 8 caractères</li>
            <li>• Au moins une lettre majuscule</li>
            <li>• Au moins une lettre minuscule</li>
            <li>• Au moins un chiffre</li>
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </Button>
      </form>
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
