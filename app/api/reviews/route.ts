/**
 * GET /api/reviews
 * Fetch all reviews with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { filterReviewsSchema } from '@/lib/schemas/reviews';
import type { ApiResponse, PaginatedReviews } from '@/lib/types/reviews';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<PaginatedReviews>>> {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!, 10) : undefined;
    const sortBy = (searchParams.get('sort_by') || 'newest') as 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated';
    const search = searchParams.get('search') || undefined;
    const featuredOnly = searchParams.get('featured_only') === 'true';

    const query = filterReviewsSchema.parse({ page, limit, rating, sort_by: sortBy, search, featured_only: featuredOnly });

    const supabase = getSupabaseBrowser();
    let supabaseQuery = supabase
      .from('reviews')
      .select('*, review_media(*), review_replies(*)', { count: 'exact' })
      .is('deleted_at', null);

    if (query.rating) {
      supabaseQuery = supabaseQuery.eq('rating', query.rating);
    }

    if (query.featured_only) {
      supabaseQuery = supabaseQuery.eq('is_featured', true);
    }

    if (query.search) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
    }

    let orderColumn = 'created_at';
    let ascending = false;

    if (query.sort_by === 'oldest') {
      ascending = true;
    } else if (query.sort_by === 'highest_rated') {
      orderColumn = 'rating';
      ascending = false;
    } else if (query.sort_by === 'lowest_rated') {
      orderColumn = 'rating';
      ascending = true;
    }

    const pageNum = Number(query.page);
    const limitNum = Number(query.limit);

    const { data: reviews, count, error } = await supabaseQuery
      .order(orderColumn, { ascending })
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    // Enrich with likes and user likes info
    const enrichedReviews = reviews.map((review) => ({
      ...review,
      likes_count: 0, // TODO: count likes
      user_liked: false, // TODO: check if user liked
    }));

    const totalPages = Math.ceil((count || 0) / limitNum);

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews: enrichedReviews,
          total_count: count || 0,
          page: pageNum,
          limit: limitNum,
          total_pages: totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch reviews',
        },
      },
      { status: 500 }
    );
  }
}
