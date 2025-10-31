'use client';

/**
 * Global Error Handler pour Next.js App Router
 * Capture les erreurs React et les envoie à Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Envoyer l'erreur à Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Oups! Une erreur s'est produite
              </h1>
              <p className="text-gray-600">
                Nous avons été notifiés et travaillons sur le problème.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={reset}
                className="w-full"
              >
                Réessayer
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
