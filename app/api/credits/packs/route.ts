import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/credits/packs
 * Get available credit packs for purchase
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get active credit packs
    const { data: packs, error: packsError } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (packsError) {
      logger.error('[GET /api/credits/packs] Failed to get credit packs', {
        error: packsError,
      });
      return NextResponse.json(
        { error: 'Failed to get credit packs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      packs: packs || [],
    });
  } catch (error) {
    logger.error('[GET /api/credits/packs] Unexpected error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
