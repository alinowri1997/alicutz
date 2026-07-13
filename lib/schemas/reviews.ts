/**
 * Zod Validation Schemas for Review Platform
 * All validation rules for API inputs and outputs
 */

import { z } from 'zod';

/**
 * Review Rating Schema (1-5)
 */
export const reviewRatingSchema = z.number().int().min(1).max(5);

/**
 * Flag Reason Schema
 */
export const flagReasonSchema = z.enum([
  'spam',
  'inappropriate',
  'harassment',
  'misinformation',
  'other',
]);

/**
 * Media Type Schema
 */
export const mediaTypeSchema = z.enum(['image', 'video']);

/**
 * Create Review Schema
 */
export const createReviewSchema = z.object({
  user_name: z.string().min(2).max(100),
  user_email: z.string().email(),
  user_avatar_url: z.string().url().optional().nullable(),
  rating: reviewRatingSchema,
  title: z.string().min(5).max(200),
  content: z.string().min(20).max(5000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Update Review Schema
 */
export const updateReviewSchema = z.object({
  rating: reviewRatingSchema.optional(),
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(20).max(5000).optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

/**
 * Create Review Reply Schema
 */
export const createReviewReplySchema = z.object({
  user_name: z.string().min(2).max(100),
  user_email: z.string().email(),
  user_avatar_url: z.string().url().optional().nullable(),
  content: z.string().min(5).max(1000),
  is_owner_reply: z.boolean().optional().default(false),
});

export type CreateReviewReplyInput = z.infer<typeof createReviewReplySchema>;

/**
 * Create Flag Schema
 */
export const createFlagSchema = z.object({
  reason: flagReasonSchema,
  description: z.string().max(500).optional(),
});

export type CreateFlagInput = z.infer<typeof createFlagSchema>;

/**
 * Upload Media Schema
 */
export const uploadMediaSchema = z.object({
  file: z.instanceof(File),
  position: z.number().int().min(0).optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;

/**
 * Pagination Query Schema
 */
export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Filter Reviews Query Schema
 */
export const filterReviewsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  rating: reviewRatingSchema.optional(),
  sort_by: z.enum(['newest', 'oldest', 'highest_rated', 'lowest_rated']).optional().default('newest'),
  search: z.string().max(200).optional(),
  featured_only: z.boolean().optional().default(false),
});

export type FilterReviewsQuery = z.infer<typeof filterReviewsSchema>;

/**
 * Validation helper function
 */
export function validateInput<T>(schema: z.ZodSchema, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation helper - returns error if validation fails
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema,
  data: unknown
): { success: boolean; data?: T; error?: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  return { success: false, error: result.error };
}
