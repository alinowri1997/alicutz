/**
 * POST /api/reviews/[id]/replies - Create a reply
 * GET /api/reviews/[id]/replies - Get replies
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase/client';
import { createReviewReplySchema } from '@/lib/schemas/reviews';
import type { ApiResponse } from '@/lib/types/reviews';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id: reviewId } = await params;
    const body = await req.json();
    const session = await supabaseBrowser.auth.getSession();

    if (!session.data.session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to reply',
          },
        },
        { status: 401 }
      );
    }

    const validated = createReviewReplySchema.parse(body);

    const { error } = await supabaseBrowser.from('review_replies').insert({
      review_id: reviewId,
      user_id: session.data.session.user.id,
      user_name: validated.user_name,
      user_email: validated.user_email,
      user_avatar_url: validated.user_avatar_url,
      content: validated.content,
      is_owner_reply: validated.is_owner_reply,
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
          code: 'REPLY_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create reply',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { id: reviewId } = await params;

    const { data: replies, error } = await supabaseBrowser
      .from('review_replies')
      .select('*')
      .eq('review_id', reviewId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: replies,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch replies',
        },
      },
      { status: 500 }
    );
  }
}
