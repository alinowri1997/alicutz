export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewStatus = "pending" | "approved" | "hidden" | "rejected";

export type ReviewService =
  | "Haircut"
  | "Fade"
  | "Color"
  | "Beard"
  | "Home Service"
  | "Other";

export interface ReviewImage {
  path: string;
  url: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface ReviewReply {
  authorName: string;
  authorRole: string;
  message: string;
  replyDate: string;
}

export interface ReviewDocument {
  id: string;
  customerName: string;
  email: string;
  country: string;
  language: string;
  avatar?: string;
  rating: ReviewRating;
  service: ReviewService;
  review: string;
  images: ReviewImage[];
  likes: number;
  verified: boolean;
  featured: boolean;
  approved: boolean;
  hidden: boolean;
  status: ReviewStatus;
  recommendation: boolean;
  visitDate?: string;
  reply?: ReviewReply;
  replyDate?: string;
  reportedCount: number;
  reports: Array<{
    reason: string;
    details?: string;
    createdAt: string;
    visitorId: string;
  }>;
  spamScore: number;
  searchText: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview extends ReviewDocument {
  userLiked: boolean;
  timeAgo: string;
}

export interface ReviewListStats {
  averageRating: number;
  totalReviews: number;
  recommendationPercentage: number;
  ratingDistribution: Record<ReviewRating, number>;
  verifiedReviews: number;
  withPhotos: number;
}

export interface ReviewListResponse {
  reviews: PublicReview[];
  stats: ReviewListStats;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export type ReviewSort =
  | "newest"
  | "oldest"
  | "highestRating"
  | "lowestRating"
  | "mostHelpful"
  | "mostLiked";

export interface ReviewQuery {
  page: number;
  limit: number;
  search?: string;
  rating?: ReviewRating;
  verified?: boolean;
  withPhotos?: boolean;
  featured?: boolean;
  service?: ReviewService;
  sort: ReviewSort;
}

export interface CreateReviewInput {
  customerName: string;
  email: string;
  country: string;
  language: string;
  service: ReviewService;
  rating: ReviewRating;
  review: string;
  visitDate?: string;
}

export interface UpdateReviewInput {
  customerName?: string;
  email?: string;
  country?: string;
  language?: string;
  service?: ReviewService;
  rating?: ReviewRating;
  review?: string;
  visitDate?: string;
  featured?: boolean;
  verified?: boolean;
  approved?: boolean;
  hidden?: boolean;
  status?: ReviewStatus;
}

export interface ReportReviewInput {
  reason: string;
  details?: string;
}

export interface ReplyReviewInput {
  message: string;
}

export interface AdminReviewDashboard {
  pendingReviews: number;
  approvedReviews: number;
  hiddenReviews: number;
  featuredReviews: number;
  averageRating: number;
  reviewGrowth: number;
  mostPopularService: ReviewService | "N/A";
  mostActiveMonth: string;
  customerSatisfaction: number;
}

export interface AdminReviewListResponse {
  dashboard: AdminReviewDashboard;
  reviews: ReviewDocument[];
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
