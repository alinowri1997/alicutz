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
      <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
        <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border border-border bg-background p-6 transition-colors duration-300 hover:border-white/20">
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
              {review.is_verified && <span className="rounded bg-accent/10 px-2 py-1 text-xs text-accent">Verified</span>}
            </div>

            {/* Title */}
            {review.title && <p className="font-medium text-text">{review.title}</p>}

            {/* Content */}
            <p className="type-small text-muted line-clamp-4">{review.content}</p>

            {/* Media */}
            {review.media && review.media.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {review.media.slice(0, 3).map((media) => (
                  <div
                    key={media.id}
                    className="relative h-16 w-16 overflow-hidden rounded border border-border bg-surface"
                  >
                    {media.media_type === 'image' ? (
                      <Image
                        src={media.storage_path}
                        alt={`${review.user_name} review photo${review.title ? ` for ${review.title}` : ''}`}
                        fill
                        sizes="64px"
                        loading="lazy"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <span className="text-xs text-muted">Video</span>
                      </div>
                    )}
                  </div>
                ))}
                {review.media.length > 3 && <div className="flex h-16 w-16 items-center justify-center rounded border border-border bg-surface">
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
