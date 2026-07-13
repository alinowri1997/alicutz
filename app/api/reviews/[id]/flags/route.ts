/**
 * POST /api/reviews/[id]/flags - Flag/report a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { createFlagSchema } from '@/lib/schemas/reviews';
import type { ApiResponse } from '@/lib/types/reviews';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id: reviewId } = await params;
    const body = await req.json();
    const supabase = getSupabaseBrowser();
    const session = await supabase.auth.getSession();

    if (!session.data.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to report reviews',
          },
        },
        { status: 401 }
      );
    }

    const validated = createFlagSchema.parse(body);

    const { error } = await supabase.from('review_flags').insert({
      review_id: reviewId,
      reason: validated.reason,
      description: validated.description,
      reported_by_user_id: session.data.session.user.id,
      status: 'pending',
    });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FLAG_ERROR',
          message: error instanceof Error ? error.message : 'Failed to flag review',
        },
      },
      { status: 500 }
    );
  }
}
