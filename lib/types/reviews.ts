/**
 * Review Platform Types
 * Comprehensive type definitions for the Ali Cutz review system
 */

/**
 * Review Rating Type - 1 to 5 stars
 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/**
 * Media Type for Review Attachments
 */
export type MediaType = 'image' | 'video';

/**
 * Report/Flag Reason Type
 */
export type FlagReason = 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';

/**
 * Flag Status Type
 */
export type FlagStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

/**
 * Core Review Entity
 */
export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar_url: string | null;
  rating: ReviewRating;
  title: string;
  content: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Review with Related Data
 */
export interface ReviewWithRelations extends Review {
  media: ReviewMedia[];
  replies: ReviewReply[];
  likes_count: number;
  user_liked: boolean;
}

/**
 * Media Attachment for Review
 */
export interface ReviewMedia {
  id: string;
  review_id: string;
  media_type: MediaType;
  storage_path: string;
  thumbnail_url: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  position: number;
  created_at: string;
}

/**
 * Like/Reaction on Review
 */
export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Reply/Comment on Review
 */
export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar_url: string | null;
  content: string;
  is_owner_reply: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Flag/Report for Moderation
 */
export interface ReviewFlag {
  id: string;
  review_id: string;
  reason: FlagReason;
  description: string | null;
  reported_by_user_id: string;
  status: FlagStatus;
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

/**
 * User Report (separate from flags)
 */
export interface ReviewReport {
  id: string;
  review_id: string;
  user_id: string;
  report_type: string;
  description: string | null;
  created_at: string;
}

/**
 * Create Review Input
 */
export interface CreateReviewInput {
  user_name: string;
  user_email: string;
  user_avatar_url?: string | null;
  rating: ReviewRating;
  title: string;
  content: string;
}

/**
 * Update Review Input
 */
export interface UpdateReviewInput {
  rating?: ReviewRating;
  title?: string;
  content?: string;
}

/**
 * Create Review Reply Input
 */
export interface CreateReviewReplyInput {
  user_name: string;
  user_email: string;
  user_avatar_url?: string | null;
  content: string;
  is_owner_reply?: boolean;
}

/**
 * Create Flag Input
 */
export interface CreateFlagInput {
  reason: FlagReason;
  description?: string;
}

/**
 * Upload Media Response
 */
export interface UploadMediaResponse {
  id: string;
  storage_path: string;
  media_type: MediaType;
  file_size: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
}

/**
 * Review Statistics
 */
export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    [key in ReviewRating]: number;
  };
  total_media: number;
  total_replies: number;
}

/**
 * Paginated Reviews Response
 */
export interface PaginatedReviews {
  reviews: ReviewWithRelations[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
