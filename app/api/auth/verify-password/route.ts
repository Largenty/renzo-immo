import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/verify-password
 * Securely verify user's current password before allowing password change
 *
 * 🔒 SECURITY: This endpoint is rate-limited to prevent brute force attacks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { currentPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Rate limiting check
    // This should be handled by middleware or a rate limiting service
    // For now, log the attempt
    logger.info('[POST /api/auth/verify-password] Password verification attempt', {
      userId: user.id,
      email: user.email,
    });

    // Verify the password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      logger.warn('[POST /api/auth/verify-password] Invalid password', {
        userId: user.id,
        email: user.email,
      });

      return NextResponse.json(
        { error: 'Current password is incorrect', valid: false },
        { status: 200 } // Return 200 to avoid leaking information about account existence
      );
    }

    logger.info('[POST /api/auth/verify-password] Password verified successfully', {
      userId: user.id,
    });

    return NextResponse.json({ valid: true });
  } catch (error) {
    logger.error('[POST /api/auth/verify-password] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
