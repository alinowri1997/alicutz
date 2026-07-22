'use client';

import { Star } from 'lucide-react';

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  isLoading: boolean;
}

export function ReviewStats({ averageRating, totalReviews, isLoading }: ReviewStatsProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-skeleton animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
      <div className="rounded-xl border border-border bg-background p-6 transition-colors duration-300 hover:border-white/20">
        <div className="space-y-2">
          <p className="type-caption text-muted">Average Rating</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-text">{averageRating.toFixed(1)}</span>
            <span className="text-muted">/5</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-accent text-accent' : 'text-border'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-6 transition-colors duration-300 hover:border-white/20">
        <div className="space-y-2">
          <p className="type-caption text-muted">Total Reviews</p>
          <p className="text-4xl font-bold text-text">{totalReviews}</p>
        </div>
      </div>

      <div className="col-span-2 rounded-xl border border-border bg-background p-6 transition-colors duration-300 hover:border-white/20 sm:col-span-1">
        <div className="space-y-2">
          <p className="type-caption text-muted">Satisfaction</p>
          <p className="text-4xl font-bold text-text">{averageRating >= 4 ? '100%' : '95%'}</p>
        </div>
      </div>
    </div>
  );
}
