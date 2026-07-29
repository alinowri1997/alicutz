"use client";

import * as React from "react";
import {motion, useReducedMotion} from "framer-motion";
import {BadgeCheck} from "lucide-react";

import type {PublicReview} from "@/lib/types/reviews";
import {cn} from "@/lib/utils";

interface ReviewsListProps {
  reviews: PublicReview[];
  isLoading: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length > 0 ? parts.map((part) => part[0]?.toUpperCase() ?? "").join("") : "AC";
}

function formatStars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const deltaMs = Date.now() - date.getTime();
  const deltaDays = Math.max(0, Math.floor(deltaMs / 86400000));

  if (deltaDays < 1) {
    return "Today";
  }
  if (deltaDays < 7) {
    return `${deltaDays}d ago`;
  }
  if (deltaDays < 30) {
    return `${Math.floor(deltaDays / 7)}w ago`;
  }
  if (deltaDays < 365) {
    return `${Math.floor(deltaDays / 30)}mo ago`;
  }

  return `${Math.floor(deltaDays / 365)}y ago`;
}

function LoadingState(): React.JSX.Element {
  return (
    <div className="grid gap-3" aria-busy="true" aria-live="polite">
      {[1, 2, 3].map((item) => (
        <article key={item} className="rounded-[24px] border border-border/70 bg-white/[0.02] p-4">
          <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-3 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-14 animate-pulse rounded-2xl bg-white/10" />
        </article>
      ))}
    </div>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <article className="rounded-[24px] border border-dashed border-border/70 bg-white/[0.02] p-5 text-sm text-muted">
      No approved reviews yet.
    </article>
  );
}

function ReviewCard({review}: {review: PublicReview}): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);
  const needsClamp = review.review.length > 210;

  return (
    <motion.article
      className="rounded-[24px] border border-border/70 bg-white/[0.03] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors hover:border-white/20"
      initial={reducedMotion ? {opacity: 1} : {opacity: 0, y: 12}}
      whileInView={reducedMotion ? {opacity: 1} : {opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.25}}
      transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background text-sm font-semibold text-text">
          {review.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.avatar} alt={`${review.customerName} avatar`} className="h-full w-full object-cover" />
          ) : (
            <span>{getInitials(review.customerName)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-medium text-text">{review.customerName}</p>
            {review.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-100">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="tracking-[0.08em] text-[#d7b36a]" aria-label={`${review.rating} out of 5 stars`}>
              {formatStars(review.rating)}
            </span>
            <span aria-hidden="true">•</span>
            <span>{formatRelativeDate(review.createdAt)}</span>
          </div>
        </div>
      </header>

      <p
        className={cn("mt-3 text-sm leading-6 text-[#e6e6e6]", !expanded && "overflow-hidden")}
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

      {needsClamp ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium tracking-[0.08em] text-[#d7b36a] transition-opacity hover:opacity-80"
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
