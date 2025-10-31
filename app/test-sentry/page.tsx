'use client';

import * as Sentry from '@sentry/nextjs';

export default function TestSentryPage() {
  const testClientError = () => {
    try {
      throw new Error('Test Sentry - Client Error');
    } catch (error) {
      Sentry.captureException(error);
      alert('Erreur envoyée à Sentry! Vérifiez votre dashboard.');
    }
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/test-sentry-error');
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Erreur envoyée à Sentry côté serveur!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-6">Test Sentry Error Tracking</h1>

        <div className="space-y-4">
          <div>
            <button
              onClick={testClientError}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Tester Erreur Client
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Envoie une erreur depuis le navigateur
            </p>
          </div>

          <div>
            <button
              onClick={testServerError}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Tester Erreur Serveur
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Envoie une erreur depuis l'API
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Sentry ne capture que en production.
            Pour tester, changez NODE_ENV=production dans .env
          </p>
        </div>
      </div>
    </div>
  );
}
