/**
 * Client-side Instrumentation pour Sentry
 * S'exécute côté navigateur
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Ajuster le taux d'échantillonnage selon vos besoins
  tracesSampleRate: 1.0,

  // Définir l'environnement
  environment: process.env.NODE_ENV,

  // Capturer seulement en production
  enabled: process.env.NODE_ENV === 'production',

  // Options de confidentialité
  beforeSend(event) {
    // Ne pas envoyer d'événements si pas de DSN configuré
    if (!SENTRY_DSN) {
      return null;
    }

    // Filtrer les données sensibles
    if (event.request) {
      // Supprimer les headers sensibles
      delete event.request.cookies;
      delete event.request.headers;
    }

    return event;
  },

  // Ignorer certaines erreurs communes
  ignoreErrors: [
    // Erreurs du navigateur qu'on ne peut pas contrôler
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Erreurs réseau
    'NetworkError',
    'Failed to fetch',
  ],
});

// Export hook pour instrumenter les navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
