import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { validatePassword } from '@/modules/auth/utils/password-validator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/change-password
 * Securely change user's password
 *
 * 🔒 SECURITY: Requires password verification before allowing change
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid password', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      logger.warn('[POST /api/auth/change-password] Invalid current password', {
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logger.error('[POST /api/auth/change-password] Failed to update password', {
        userId: user.id,
        error: updateError.message,
      });

      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    logger.info('[POST /api/auth/change-password] Password changed successfully', {
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    logger.error('[POST /api/auth/change-password] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
