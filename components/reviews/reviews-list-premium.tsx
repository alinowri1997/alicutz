"use client";

import * as React from "react";
import {motion} from "framer-motion";

import type {PublicReview} from "@/lib/types/reviews";
import {cn} from "@/lib/utils";

interface ReviewsListProps {
  reviews: PublicReview[];
  isLoading: boolean;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "AC";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function formatStars(rating: number): string {
  const safeRating = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function countryToFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🌍";
  }

  const normalized = countryCode.toUpperCase();
  const first = normalized.codePointAt(0);
  const second = normalized.codePointAt(1);

  if (!first || !second) {
    return "🌍";
  }

  const regionalIndicatorA = 0x1f1e6;
  const asciiA = 65;

  return String.fromCodePoint(
    regionalIndicatorA + (first - asciiA),
    regionalIndicatorA + (second - asciiA),
  );
}

function LoadingState(): React.JSX.Element {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((item) => (
        <article key={item} className="rounded-2xl border border-border/70 bg-white/[0.02] p-4" aria-hidden="true">
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-14 animate-pulse rounded bg-white/10" />
        </article>
      ))}
    </div>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <article className="rounded-2xl border border-dashed border-border/70 bg-white/[0.02] p-5 text-sm text-muted">
      No approved reviews yet. Be the first to share your experience.
    </article>
  );
}

function ReviewCard({review}: {review: PublicReview}): React.JSX.Element {
  const [expanded, setExpanded] = React.useState(false);
  const shouldClamp = review.review.length > 180;

  return (
    <motion.article
      className="rounded-2xl border border-border/70 bg-white/[0.03] p-4 transition-colors hover:border-border"
      initial={{opacity: 0, y: 8}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.2}}
      transition={{duration: 0.25, ease: [0.16, 1, 0.3, 1]}}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-text">
          {getInitials(review.customerName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-text">{review.customerName}</p>
            <span className="text-xs tracking-[0.08em] text-[#d7b36a]" aria-label={`${review.rating} out of 5 stars`}>
              {formatStars(review.rating)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span>{review.timeAgo}</span>
            <span aria-hidden="true">•</span>
            <span title={review.countryCode?.toUpperCase() ?? "Unknown country"}>
              {countryToFlag(review.countryCode)}
            </span>
            <span>{review.countryCode?.toUpperCase() ?? "--"}</span>
          </div>
        </div>
      </header>

      <p
        className={cn("mt-3 text-sm leading-6 text-[#e5e5e5]", !expanded && "overflow-hidden")}
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
              }
            : undefined
        }
      >
        {review.review}
      </p>

      {shouldClamp ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium tracking-[0.06em] text-[#d7b36a] transition-opacity hover:opacity-80"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </motion.article>
  );
}

export function ReviewsList({reviews, isLoading}: ReviewsListProps): React.JSX.Element {
  if (isLoading) {
    return <LoadingState />;
  }

  if (reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3" aria-live="polite">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
