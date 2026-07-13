/**
 * POST /api/reviews/[id]/likes - Like a review
 * DELETE /api/reviews/[id]/likes - Unlike a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import type { ApiResponse } from '@/lib/types/reviews';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id: reviewId } = await params;

    const supabase = getSupabaseBrowser();
    const session = await supabase.auth.getSession();

    if (!session.data.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to like reviews',
          },
        },
        { status: 401 }
      );
    }

    const { error } = await supabase.from('review_likes').insert({
      review_id: reviewId,
      user_id: session.data.session.user.id,
    });

    if (error && error.code !== 'PGRST116') throw error;

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
          code: 'LIKE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to like review',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id: reviewId } = await params;

    const supabase = getSupabaseBrowser();
    const session = await supabase.auth.getSession();

    if (!session.data.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in',
          },
        },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', session.data.session.user.id);

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNLIKE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to unlike review',
        },
      },
      { status: 500 }
    );
  }
}
