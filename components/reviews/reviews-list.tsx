'use client';

import Image from 'next/image';
import { Star, MessageCircle, Heart } from 'lucide-react';
import type { ReviewWithRelations } from '@/lib/types/reviews';

interface ReviewsListProps {
  reviews: ReviewWithRelations[];
  isLoading: boolean;
}

export function ReviewsList({ reviews, isLoading }: ReviewsListProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-32 rounded bg-skeleton animate-pulse" />
            <div className="h-12 w-full rounded bg-skeleton animate-pulse" />
            <div className="h-4 w-48 rounded bg-skeleton animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center">
        <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-border bg-background p-6 hover:border-accent/50 transition-colors">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-text">{review.user_name}</p>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-accent text-accent' : 'text-border'}`}
                    />
                  ))}
                </div>
              </div>
              {review.is_verified && <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">Verified</span>}
            </div>

            {/* Title */}
            {review.title && <p className="font-medium text-text">{review.title}</p>}

            {/* Content */}
            <p className="text-sm text-muted line-clamp-3">{review.content}</p>

            {/* Media */}
            {review.media && review.media.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {review.media.slice(0, 3).map((media) => (
                  <div
                    key={media.id}
                    className="h-16 w-16 rounded bg-surface border border-border overflow-hidden relative"
                  >
                    {media.media_type === 'image' ? (
                      <Image
                        src={media.storage_path}
                        alt="Review"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <span className="text-xs text-muted">Video</span>
                      </div>
                    )}
                  </div>
                ))}
                {review.media.length > 3 && <div className="h-16 w-16 rounded bg-surface border border-border flex items-center justify-center">
                  <span className="text-xs text-muted">+{review.media.length - 3}</span>
                </div>}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-4 text-xs text-muted pt-3 border-t border-border/50">
              <button className="flex items-center gap-1 hover:text-accent transition-colors">
                <Heart className="h-3.5 w-3.5" />
                <span>{review.likes_count || 0}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-accent transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{review.replies?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
