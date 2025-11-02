"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser, useSignOut } from "@/domain/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthCard, AuthLoading } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const signOutMutation = useSignOut();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Gestion centralisée des redirections (évite les race conditions)
  useEffect(() => {
    if (isLoading) return; // Attendre le chargement

    const verified = searchParams.get("verified");

    // Priorité 1 : Pas d'utilisateur → login
    if (!user) {
      toast.error("Accès refusé", {
        description: "Vous devez être connecté pour vérifier votre email",
      });
      router.push("/auth/login");
      return;
    }

    // Priorité 2 : Email déjà vérifié → dashboard
    if (user.emailVerified) {
      if (verified === "success") {
        toast.success("Email vérifié !", {
          description: "Votre email a été confirmé avec succès",
        });
      }

      // Redirection avec cleanup
      const timeoutId = setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

      return () => clearTimeout(timeoutId);
    }

    // Priorité 3 : Erreur de vérification (reste sur la page)
    if (verified === "failed") {
      toast.error("Erreur de vérification", {
        description: "Le lien de vérification est invalide ou a expiré",
      });
    }
  }, [user, isLoading, searchParams, router]);

  // ✅ Polling optimisé avec backoff exponentiel
  useEffect(() => {
    if (!user || user.emailVerified || isLoading) {
      return;
    }

    let interval = 10000; // Commence à 10 secondes
    let attempts = 0;
    const maxAttempts = 60; // ~10 minutes max avec backoff

    const poll = async () => {
      if (attempts >= maxAttempts) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        toast.info("Vérification automatique arrêtée", {
          description: "Cliquez sur 'Renvoyer l'email' si besoin",
        });
        return;
      }

      try {
        await refetch();
        attempts++;

        // Backoff exponentiel : augmente l'intervalle tous les 5 attempts
        if (attempts % 5 === 0 && interval < 30000) {
          interval = Math.min(interval * 1.5, 30000); // Max 30 secondes
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = setInterval(poll, interval);
          }
        }
      } catch (error) {
        console.error("Error polling email verification:", error);
      }
    };

    // Première vérification immédiate, puis polling régulier
    pollingIntervalRef.current = setInterval(poll, interval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, isLoading, refetch]);

  // Cooldown pour renvoyer l'email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = useCallback(async () => {
    if (!user?.email) return;

    setIsResending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        toast.error("Erreur", {
          description: error.message,
        });
      } else {
        toast.success("Email renvoyé !", {
          description: "Vérifiez votre boîte de réception",
        });
        setResendCooldown(60); // 60 secondes de cooldown
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de renvoyer l'email",
      });
    } finally {
      setIsResending(false);
    }
  }, [user?.email]);

  const handleLogout = useCallback(async () => {
    try {
      await signOutMutation.mutateAsync();
      // Le hook useSignOut gère déjà la redirection vers /auth/login
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur", {
        description: "Impossible de se déconnecter",
      });
    }
  }, [signOutMutation]);

  // ✅ Afficher un état de chargement ou si l'utilisateur n'est pas connecté
  // ✅ Si l'utilisateur n'est pas connecté, ne pas afficher le contenu
  if (isLoading || !user) {
    return (
      <AuthCard
        title="Vérification..."
        subtitle="Chargement de vos informations"
      >
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Vérifiez votre email"
      subtitle="Un email de confirmation a été envoyé"
    >
      <div className="space-y-6">
        {/* Icon et Message */}
        <div className="py-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Vérification requise
          </h3>
          <p className="mx-auto max-w-md text-sm text-slate-600">
            Nous avons envoyé un email de confirmation à{" "}
            <span className="font-medium text-slate-900">{user?.email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 rounded-lg bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-slate-700">
              Ouvrez l&apos;email et cliquez sur le lien de confirmation
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-sm text-slate-700">
              Le lien est valide pendant 24 heures
            </p>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
            <p className="text-sm text-slate-700">
              Pensez à vérifier vos spams si vous ne le voyez pas
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : resendCooldown > 0 ? (
              <>Renvoyer dans {resendCooldown}s</>
            ) : (
              <>Renvoyer l&apos;email</>
            )}
          </Button>

          <Button
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
            variant="ghost"
            className="w-full"
          >
            {signOutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Déconnexion...
              </>
            ) : (
              "Se déconnecter"
            )}
          </Button>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-slate-500">
          Une fois votre email vérifié, vous pourrez accéder à votre dashboard.
          La page se met à jour automatiquement.
        </p>
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Vérification..."
          subtitle="Chargement de vos informations"
        />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
