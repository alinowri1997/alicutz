"use client";

import {motion} from "framer-motion";
import {Star} from "lucide-react";

import type {ReviewListStats} from "@/lib/types/reviews";

interface ReviewStatsProps {
  stats: ReviewListStats;
  isLoading: boolean;
}

const RATINGS: Array<1 | 2 | 3 | 4 | 5> = [5, 4, 3, 2, 1];

export function ReviewStats({stats, isLoading}: ReviewStatsProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-5 rounded-[28px] border border-border/70 bg-white/[0.04] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.28)] backdrop-blur-md lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-3">
          <div className="h-9 w-56 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-72 animate-pulse rounded bg-white/10" />
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-4 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const percentages = RATINGS.map((rating) => {
    const count = stats.ratingDistribution[rating] ?? 0;
    const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
    return {rating, percentage};
  });

  return (
    <div className="grid gap-5 rounded-[28px] border border-border/70 bg-white/[0.04] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.28)] backdrop-blur-md lg:grid-cols-[1.15fr_1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Verified client sentiment</p>
        <div className="mt-3 flex items-end gap-4">
          <div className="flex items-center gap-2 text-3xl font-semibold text-text md:text-4xl">
            <span aria-hidden="true">★★★★★</span>
            <span>{stats.averageRating.toFixed(1)}</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted">Based on {stats.totalReviews} verified reviews</p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-black/20 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Average rating</p>
            <p className="mt-1 text-xl font-semibold text-text">{stats.averageRating.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-black/20 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Total reviews</p>
            <p className="mt-1 text-xl font-semibold text-text">{stats.totalReviews}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-black/20 px-3 py-3 col-span-2 md:col-span-1">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Recommendation</p>
            <p className="mt-1 text-xl font-semibold text-text">{stats.recommendationPercentage}% Recommend Alicutz</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {percentages.map(({rating, percentage}) => (
          <div key={rating} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-text">
              <span>{"★".repeat(rating)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#c89b2f] to-[#f2d17d]"
                initial={{width: 0}}
                animate={{width: `${percentage}%`}}
                transition={{duration: 0.55, ease: "easeOut"}}
              />
            </div>
            <span className="text-sm text-muted">{percentage}%</span>
          </div>
        ))}

        <div className="rounded-xl border border-border/70 bg-black/20 p-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>{stats.verifiedReviews} verified reviewers • {stats.withPhotos} with customer photos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
