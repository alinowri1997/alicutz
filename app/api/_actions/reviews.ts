/**
 * Review Actions - Server-side operations
 * Handle all review CRUD operations
 */

'use server';

import { getSupabaseBrowser, getCurrentUser } from '@/lib/supabase/client';
import { createReviewSchema, updateReviewSchema, createReviewReplySchema, createFlagSchema } from '@/lib/schemas/reviews';
import type { Review, ReviewWithRelations, CreateReviewInput } from '@/lib/types/reviews';

/**
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const validated = createReviewSchema.parse(input);

  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.from('reviews').insert({
    user_id: user.id,
    user_name: validated.user_name,
    user_email: validated.user_email,
    user_avatar_url: validated.user_avatar_url,
    rating: validated.rating,
    title: validated.title,
    content: validated.content,
  }).select().single();

  if (error) throw error;
  return data;
}

/**
 * Get review by ID with relations
 */
export async function getReview(reviewId: string): Promise<ReviewWithRelations | null> {
  const user = await getCurrentUser();
  const supabase = getSupabaseBrowser();

  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .is('deleted_at', null)
    .single();

  if (reviewError) return null;

  const { data: media } = await supabase
    .from('review_media')
    .select('*')
    .eq('review_id', reviewId)
    .order('position', { ascending: true });

  const { data: replies } = await supabase
    .from('review_replies')
    .select('*')
    .eq('review_id', reviewId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const { count: likesCount } = await supabase
    .from('review_likes')
    .select('*', { count: 'exact' })
    .eq('review_id', reviewId);

  let userLiked = false;
  if (user) {
    const { data: userLike } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();
    userLiked = !!userLike;
  }

  return {
    ...review,
    media: media || [],
    replies: replies || [],
    likes_count: likesCount || 0,
    user_liked: userLiked,
  };
}

/**
 * Get all reviews with pagination
 */
export async function getReviews(page: number = 1, limit: number = 10): Promise<{
  reviews: ReviewWithRelations[];
  total: number;
}> {
  const user = await getCurrentUser();
  const offset = (page - 1) * limit;

  const { data: reviews, count } = await getSupabaseBrowser()
    .from('reviews')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!reviews) return { reviews: [], total: 0 };

  const enrichedReviews = await Promise.all(
    reviews.map(async (review) => {
      const { data: media } = await getSupabaseBrowser()
        .from('review_media')
        .select('*')
        .eq('review_id', review.id);

      const { data: replies } = await getSupabaseBrowser()
        .from('review_replies')
        .select('*')
        .eq('review_id', review.id)
        .is('deleted_at', null);

      const { count: likesCount } = await getSupabaseBrowser()
        .from('review_likes')
        .select('*', { count: 'exact' })
        .eq('review_id', review.id);

      let userLiked = false;
      if (user) {
        const { data: userLike } = await getSupabaseBrowser()
          .from('review_likes')
          .select('*')
          .eq('review_id', review.id)
          .eq('user_id', user.id)
          .single();
        userLiked = !!userLike;
      }

      return {
        ...review,
        media: media || [],
        replies: replies || [],
        likes_count: likesCount || 0,
        user_liked: userLiked,
      };
    })
  );

  return {
    reviews: enrichedReviews,
    total: count || 0,
  };
}

/**
 * Update a review
 */
export async function updateReview(reviewId: string, input: Record<string, unknown>): Promise<Review> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const validated = updateReviewSchema.parse(input);

  const { data, error } = await getSupabaseBrowser()
    .from('reviews')
    .update({
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a review (soft delete)
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await getSupabaseBrowser()
    .from('reviews')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Like a review
 */
export async function likeReview(reviewId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await getSupabaseBrowser().from('review_likes').insert({
    review_id: reviewId,
    user_id: user.id,
  });

  if (error && error.code !== 'PGRST116') throw error;
}

/**
 * Unlike a review
 */
export async function unlikeReview(reviewId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await getSupabaseBrowser()
    .from('review_likes')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Create a reply to a review
 */
export async function createReply(reviewId: string, input: Record<string, unknown>): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const validated = createReviewReplySchema.parse(input);

  const { error } = await getSupabaseBrowser().from('review_replies').insert({
    review_id: reviewId,
    user_id: user.id,
    user_name: validated.user_name,
    user_email: validated.user_email,
    user_avatar_url: validated.user_avatar_url,
    content: validated.content,
    is_owner_reply: validated.is_owner_reply,
  });

  if (error) throw error;
}

/**
 * Flag/report a review
 */
export async function flagReview(reviewId: string, input: Record<string, unknown>): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const validated = createFlagSchema.parse(input);

  const { error } = await getSupabaseBrowser().from('review_flags').insert({
    review_id: reviewId,
    reason: validated.reason,
    description: validated.description,
    reported_by_user_id: user.id,
    status: 'pending',
  });

  if (error) throw error;
}
