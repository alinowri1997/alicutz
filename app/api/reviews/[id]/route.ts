/**
 * GET /api/reviews/[id] - Get a specific review
 * PUT /api/reviews/[id] - Update a review
 * DELETE /api/reviews/[id] - Delete a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { updateReviewSchema } from '@/lib/schemas/reviews';
import type { ApiResponse, ReviewWithRelations } from '@/lib/types/reviews';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ReviewWithRelations>>> {
  try {
    const { id } = await params;

    const supabase = getSupabaseBrowser();
    const { data: review, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    const { data: media } = await supabase.from('review_media').select('*').eq('review_id', id);
    const { data: replies } = await supabase
      .from('review_replies')
      .select('*')
      .eq('review_id', id)
      .is('deleted_at', null);
    const { count: likesCount } = await supabase
      .from('review_likes')
      .select('*', { count: 'exact' })
      .eq('review_id', id);

    const enrichedReview = {
      ...review,
      media: media || [],
      replies: replies || [],
      likes_count: likesCount || 0,
      user_liked: false,
    };

    return NextResponse.json(
      {
        success: true,
        data: enrichedReview,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch review',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const { id } = await params;
    const body = await req.json();

    const validated = updateReviewSchema.parse(body);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from('reviews')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

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
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update review',
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
    const { id } = await params;

    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from('reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

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
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete review',
        },
      },
      { status: 500 }
    );
  }
}
