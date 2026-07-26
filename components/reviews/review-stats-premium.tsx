"use client";

import {motion} from "framer-motion";
import {BadgeCheck, GalleryHorizontalEnd, Medal, Sparkles, Star} from "lucide-react";

import type {ReviewListStats} from "@/lib/types/reviews";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils";

interface ReviewStatsProps {
  stats: ReviewListStats;
  isLoading: boolean;
}

const RATINGS: Array<1 | 2 | 3 | 4 | 5> = [5, 4, 3, 2, 1];

export function ReviewStats({stats, isLoading}: ReviewStatsProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="grid gap-5 rounded-[28px] border border-border/70 bg-white/[0.04] p-5 shadow-[0_24px_56px_rgba(0,0,0,0.28)] backdrop-blur-md lg:grid-cols-[1.08fr_0.92fr] sm:p-6">
        <div className="space-y-3">
          <div className="h-9 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-72 animate-pulse rounded-full bg-white/10" />
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-4 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  const percentages = RATINGS.map((rating) => {
    const count = stats.ratingDistribution[rating] ?? 0;
    const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
    return {rating, percentage, count};
  });

  return (
    <div className="grid gap-5 rounded-[28px] border border-border/70 bg-white/[0.04] p-5 shadow-[0_24px_56px_rgba(0,0,0,0.28)] backdrop-blur-md lg:grid-cols-[1.08fr_0.92fr] sm:p-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Verified client sentiment</p>
          <div className="mt-3 flex items-end gap-3">
            <div className="flex items-center gap-2 text-3xl font-semibold text-text md:text-4xl">
              <span aria-hidden="true">★★★★★</span>
              <span>{stats.averageRating.toFixed(1)}</span>
            </div>
            <BadgeCheck className="mb-1 h-5 w-5 text-emerald-300" aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm text-muted">Based on {stats.totalReviews} verified reviews and live approval workflow.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard icon={Star} label="Average rating" value={stats.averageRating.toFixed(1)} tone="accent" />
          <StatCard icon={Medal} label="Total reviews" value={String(stats.totalReviews)} tone="neutral" />
          <StatCard icon={GalleryHorizontalEnd} label="With photos" value={String(stats.withPhotos)} tone="neutral" />
          <StatCard icon={BadgeCheck} label="Verified" value={String(stats.verifiedReviews)} tone="emerald" className="col-span-2 md:col-span-1" />
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted">
          <div className="flex items-center gap-2 text-text">
            <Sparkles className="h-4 w-4 text-[#f4cb63]" aria-hidden="true" />
            <span>{stats.recommendationPercentage}% of reviewers recommend Alicutz</span>
          </div>
          <p className="mt-2">The review layout is designed for fast scanning on desktop and generous spacing on mobile.</p>
        </div>
      </div>

      <div className="space-y-3">
        {percentages.map(({rating, percentage, count}) => (
          <div key={rating} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-text">
              <span>{"★".repeat(rating)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#d8aa45] via-[#f4cb63] to-[#f9e8a8]"
                initial={{width: 0}}
                animate={{width: `${percentage}%`}}
                transition={{duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
              />
            </div>
            <span className="text-sm text-muted">{count}</span>
          </div>
        ))}

        <Card className="border-border/70 bg-background/70">
          <CardHeader className="pb-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Experience markers</p>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-muted">
            <p>Owner response architecture is reserved in every card.</p>
            <p>Verified visit badges can be enabled later without changing the layout.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: React.ComponentType<{className?: string}>;
  label: string;
  value: string;
  tone: "accent" | "neutral" | "emerald";
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
        tone === "accent" && "border-[#f4cb63]/25 bg-[#f4cb63]/10",
        tone === "neutral" && "border-border bg-background/70",
        tone === "emerald" && "border-emerald-300/25 bg-emerald-500/10",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold text-text">{value}</p>
    </div>
  );
}
