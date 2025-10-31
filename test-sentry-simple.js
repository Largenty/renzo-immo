// Test simple de Sentry
const Sentry = require('@sentry/nextjs');

// Configurer Sentry avec votre DSN
Sentry.init({
  dsn: 'https://bacc28f3b0430467430032378383e4ae@o4510277996183552.ingest.de.sentry.io/4510277998084176',
  environment: 'test',
  tracesSampleRate: 1.0,
});

// Envoyer un message de test
console.log('📤 Envoi d\'un message de test à Sentry...');

Sentry.captureMessage('🎉 Test depuis Claude Code - Configuration réussie!', 'info');

// Envoyer une erreur de test
try {
  throw new Error('🧪 Test Error - Configuration Sentry OK!');
} catch (error) {
  Sentry.captureException(error);
}

console.log('✅ Messages envoyés! Vérifiez votre dashboard Sentry dans ~5 secondes.');

// Attendre que les messages soient envoyés
setTimeout(() => {
  console.log('✨ Terminé! Allez voir: https://renzo-immo.sentry.io/issues/');
  process.exit(0);
}, 2000);
