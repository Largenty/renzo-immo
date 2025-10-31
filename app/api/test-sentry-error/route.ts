import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    throw new Error('Test Sentry - Server Error');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { message: 'Erreur serveur envoyée à Sentry!' },
      { status: 500 }
    );
  }
}
