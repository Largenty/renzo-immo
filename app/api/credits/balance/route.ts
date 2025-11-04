import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

/**
 * Handler for getting credit balance
 * ✅ Auth handled by middleware
 */
async function getBalanceHandler(request: AuthenticatedRequest) {
  try {
    const { user, supabase } = request;

    // Get user credits using database function
    const { data: credits, error: creditsError } = await supabase.rpc(
      'get_user_credits',
      {
        p_user_id: user.id,
      }
    );

    if (creditsError) {
      logger.error('[GET /api/credits/balance] Failed to get credits', {
        error: creditsError,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to get credit balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      credits: credits || 0,
      userId: user.id,
    });
  } catch (error) {
    logger.error('[GET /api/credits/balance] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/credits/balance
 * ✅ Protected by auth middleware
 */
export const GET = withAuth(getBalanceHandler);
