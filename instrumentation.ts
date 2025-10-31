/**
 * Next.js Instrumentation Hook
 * Pour Sentry et autres outils de monitoring
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Sentry Server-side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Ajuster le taux d'échantillonnage selon vos besoins
      tracesSampleRate: 1.0,

      // Définir l'environnement
      environment: process.env.NODE_ENV,

      // Capturer seulement en production
      enabled: process.env.NODE_ENV === 'production',

      // Options de confidentialité
      beforeSend(event) {
        // Ne pas envoyer d'événements si pas de DSN configuré
        if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
          return null;
        }

        // Filtrer les données sensibles dans les requêtes serveur
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;

          // Supprimer les query params sensibles
          if (event.request.url) {
            try {
              const url = new URL(event.request.url);
              // Supprimer les tokens, clés API, etc.
              url.searchParams.delete('token');
              url.searchParams.delete('api_key');
              url.searchParams.delete('password');
              event.request.url = url.toString();
            } catch (e) {
              // URL invalide, ignorer
            }
          }
        }

        // Filtrer les breadcrumbs sensibles
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.filter((breadcrumb) => {
            // Filtrer les logs contenant des données sensibles
            if (breadcrumb.message?.includes('password') || breadcrumb.message?.includes('token')) {
              return false;
            }
            return true;
          });
        }

        return event;
      },

      // Ignorer certaines erreurs communes
      ignoreErrors: [
        'NetworkError',
        'Failed to fetch',
        'AbortError',
      ],
    });
  }

  // Sentry Edge Runtime (Middleware, Edge API routes)
  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',

      beforeSend(event) {
        if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
          return null;
        }

        // Filtrer les données sensibles
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }

        return event;
      },
    });
  }
}
