'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared';
import { CheckCircle2, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { useCurrentUser } from '@/modules/auth';
import { useCreditBalance } from '@/modules/billing';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'timeout';

export default function CreditsSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  const { data: user } = useCurrentUser();
  const { data: credits, refetch } = useCreditBalance();

  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [purchasedAmount, setPurchasedAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!sessionId || !user) {
      router.push('/dashboard/credits');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Étape 1: Vérifier que la session Stripe a bien été payée
        const verifyResponse = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Erreur lors de la vérification du paiement');
        }

        const { success, amount } = await verifyResponse.json();

        if (!success) {
          throw new Error('Le paiement n\'a pas été confirmé par Stripe');
        }

        setPurchasedAmount(amount);

        // Étape 2: Polling pour vérifier que les crédits ont été ajoutés (max 30 secondes)
        let attempts = 0;
        const maxAttempts = 15; // 15 * 2 secondes = 30 secondes
        const initialCredits = credits || 0;

        const pollCredits = async (): Promise<boolean> => {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const result = await refetch();
          const newCredits = result.data || 0;

          // Vérifier si les crédits ont augmenté
          if (newCredits > initialCredits) {
            setStatus('success');
            return true;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            setStatus('timeout');
            setErrorMessage('Le webhook Stripe tarde à traiter votre paiement. Vos crédits arriveront sous peu.');
            return false;
          }

          return pollCredits();
        };

        await pollCredits();
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de la vérification');
      }
    };

    verifyPayment();
  }, [sessionId, user, router, refetch, credits]);

  if (!sessionId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Vérification du paiement...</CardTitle>
              <CardDescription>Veuillez patienter pendant que nous confirmons votre achat</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl">Paiement réussi !</CardTitle>
              <CardDescription>Vos crédits ont été ajoutés à votre compte</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <CardTitle className="text-3xl">Erreur de vérification</CardTitle>
              <CardDescription>Une erreur est survenue lors de la vérification</CardDescription>
            </>
          )}

          {status === 'timeout' && (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-orange-500" />
              </div>
              <CardTitle className="text-3xl">Traitement en cours</CardTitle>
              <CardDescription>Le paiement est confirmé mais le traitement prend plus de temps</CardDescription>
            </>
          )}
        </CardHeader>

        {status === 'success' && (
          <>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-4">
                <p className="text-sm opacity-90">Votre nouveau solde</p>
                <p className="text-4xl font-bold mt-1">{credits} crédits</p>
                {purchasedAmount && (
                  <p className="text-sm opacity-75 mt-2">+{purchasedAmount} crédits ajoutés</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-left text-sm">
                    <p className="font-semibold text-green-900">Transaction confirmée</p>
                    <p className="text-green-700 mt-1">Un reçu a été envoyé à votre adresse email</p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                Vous pouvez maintenant utiliser vos crédits pour générer des images avec l'IA
              </p>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/dashboard/projects')} size="lg">
                Créer un projet
              </Button>
              <Button onClick={() => router.push('/dashboard/credits?refresh=true')} variant="outline" size="lg">
                Voir mes crédits
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'error' && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-md p-6">
              <p className="text-sm font-semibold text-red-900 mb-2">Erreur</p>
              <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Réessayer
                </Button>
                <Button onClick={() => router.push('/dashboard/credits?refresh=true')} variant="default">
                  Retour aux crédits
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {status === 'timeout' && (
          <CardContent>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-6">
              <p className="text-sm font-semibold text-orange-900 mb-2">Traitement en cours</p>
              <p className="text-sm text-orange-700 mb-4">
                {errorMessage}
              </p>
              <p className="text-xs text-orange-600 mb-4">
                Votre paiement a bien été accepté par Stripe. Les crédits devraient apparaître dans quelques instants.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Actualiser
                </Button>
                <Button onClick={() => router.push('/dashboard/credits?refresh=true')} variant="default">
                  Voir mes crédits
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {status === 'success' && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Un reçu détaillé a été envoyé à votre adresse email</p>
        </div>
      )}
    </div>
  );
}
