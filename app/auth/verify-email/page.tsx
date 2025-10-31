"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/domain/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthCard } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Vérifier si l'email est déjà vérifié
  useEffect(() => {
    if (!isLoading && user?.emailVerified) {
      // Email déjà vérifié, rediriger vers le dashboard
      // Note: user.emailVerified vient du mapper domain qui utilise confirmed_at
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Cooldown pour renvoyer l'email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
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
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (isLoading) {
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
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Vérification requise
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Nous avons envoyé un email de confirmation à{" "}
            <span className="font-medium text-slate-900">{user?.email}</span>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Ouvrez l&apos;email et cliquez sur le lien de confirmation
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">
              Le lien est valide pendant 24 heures
            </p>
          </div>
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            variant="ghost"
            className="w-full"
          >
            Se déconnecter
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-center text-slate-500">
          Une fois votre email vérifié, vous pourrez accéder à votre dashboard
        </p>
      </div>
    </AuthCard>
  );
}
