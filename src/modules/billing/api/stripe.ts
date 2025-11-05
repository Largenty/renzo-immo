import Stripe from 'stripe';
import { logger } from '@/lib/logger';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

/**
 * Server-side Stripe instance
 * ⚠️ NEVER expose this on the client
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
  appInfo: {
    name: 'Renzo Immobilier',
    version: '1.0.0',
  },
});

logger.info('✅ Stripe initialized', {
  mode: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live',
});
