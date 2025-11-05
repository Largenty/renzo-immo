"use client";

/**
 * Global Error Handler pour Next.js App Router
 * Capture les erreurs React et les envoie à Sentry
 */

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/shared";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [sentryFailed, setSentryFailed] = useState(false);

  useEffect(() => {
    // ✅ Extract error details for logging (error object contains message, name, stack, digest)
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
    };

    // ✅ Logger l'erreur localement
    logger.error("Global error caught:", errorDetails);

    // ✅ Envoyer l'erreur à Sentry si configuré
    try {
      // Vérifier que Sentry est configuré (DSN présent)
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: {
            errorBoundary: "global",
          },
          extra: {
            digest: error.digest,
          },
        });
      } else {
        logger.warn("Sentry not configured, skipping error reporting");
      }
    } catch (sentryError) {
      // ✅ Ne pas laisser Sentry casser l'error boundary
      logger.error("Failed to send error to Sentry:", sentryError);
      setSentryFailed(true);
    }
  }, [error]); // error object as single dependency is sufficient

  const errorMessage = error.message || "Une erreur inattendue s'est produite";
  const errorName = error.name || "Error";

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Erreur - Renzo Immobilier</title>
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-8 text-center">
            <div role="alert" aria-live="assertive">
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Oups! Une erreur s'est produite
              </h1>
              <p className="text-gray-600">
                Nous avons été notifiés et travaillons sur le problème.
              </p>
            </div>

            {/* ✅ Afficher les détails de l'erreur en développement */}
            {process.env.NODE_ENV === "development" && (
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <p className="mb-2 text-xs font-semibold uppercase text-red-700">
                  Détails de l'erreur
                </p>
                <div className="space-y-1">
                  <p className="break-all font-mono text-sm text-red-800">
                    <strong>Type:</strong> {errorName}
                  </p>
                  <p className="break-all font-mono text-sm text-red-800">
                    <strong>Message:</strong> {errorMessage}
                  </p>
                  {error.digest && (
                    <p className="break-all font-mono text-sm text-red-800">
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  {sentryFailed && (
                    <p className="mt-2 rounded bg-amber-100 p-2 font-mono text-xs text-amber-800">
                      ⚠️ Erreur non envoyée à Sentry (offline ou rate limit)
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-red-700">
                        Stack trace
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-red-100 p-2 font-mono text-xs text-red-800">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={reset}
                className="w-full"
                aria-label="Réessayer de charger la page"
              >
                Réessayer
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  // ✅ Utiliser window.location pour forcer un rechargement complet après erreur globale
                  window.location.href = "/";
                }}
                className="w-full"
                aria-label="Retourner à la page d'accueil"
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
