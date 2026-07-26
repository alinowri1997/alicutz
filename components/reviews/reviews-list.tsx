"use client";

import * as React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {BadgeCheck, Flag, Heart, Share2, ShieldCheck, Sparkles} from "lucide-react";

import type {PublicReview} from "@/lib/types/reviews";

interface ReviewsListProps {
  reviews: PublicReview[];
  isLoading: boolean;
  onLike: (review: PublicReview) => Promise<void>;
  onReport: (review: PublicReview) => Promise<void>;
  onShare: (review: PublicReview) => Promise<void>;
  onOpenImage: (reviewIndex: number, imageIndex: number) => void;
}

function countryFlag(country: string): string {
  const code = country.trim().slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return "🌍";
  }

  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AC";
}

function formatVisitDate(value: string | undefined): string {
  if (!value) {
    return "Visit date not specified";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Visit date not specified";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReviewsList({
  reviews,
  isLoading,
  onLike,
  onReport,
  onShare,
  onOpenImage,
}: ReviewsListProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-[24px] border border-border/70 bg-white/[0.04] p-5 shadow-[0_20px_46px_rgba(0,0,0,0.23)]">
            <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border/70 bg-white/[0.03] p-10 text-center">
        <h3 className="text-lg font-semibold text-text">No reviews matched these filters</h3>
        <p className="mt-2 text-sm text-muted">Try switching filters, changing sort order, or searching with fewer keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {reviews.map((review, reviewIndex) => (
        <motion.article
          key={review.id}
          className="rounded-[26px] border border-border/70 bg-white/[0.045] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-6"
          initial={{opacity: 0, y: 14}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.2}}
          transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
        >
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {review.avatar ? (
                <Image
                  src={review.avatar}
                  alt={`${review.customerName} avatar`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4af37]/25 text-sm font-semibold text-[#f8df9a]">
                  {initials(review.customerName)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text">{review.customerName}</p>
                  <span className="text-sm" aria-label={`Country ${review.country}`}>{countryFlag(review.country)}</span>
                  <span className="text-xs text-muted">{review.language}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{review.timeAgo} • Visit: {formatVisitDate(review.visitDate)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {review.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-200">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified
                </span>
              ) : null}
              {review.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-500/10 px-2.5 py-1 text-amber-200">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Featured
                </span>
              ) : null}
              <span className="rounded-full border border-border/70 bg-black/25 px-2.5 py-1 text-muted">{review.service}</span>
            </div>
          </header>

          <div className="mt-3 flex items-center gap-1 text-amber-400" aria-label={`${review.rating} star rating`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <span key={value} className={value <= review.rating ? "opacity-100" : "opacity-25"}>★</span>
            ))}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#e8e8e8]">{review.review}</p>

          {review.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {review.images.slice(0, 3).map((image, imageIndex) => (
                <button
                  key={`${review.id}-${image.path}`}
                  type="button"
                  className="group relative overflow-hidden rounded-xl border border-border/70"
                  onClick={() => onOpenImage(reviewIndex, imageIndex)}
                  aria-label={`Open review image ${imageIndex + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={`${review.customerName} uploaded review image ${imageIndex + 1}`}
                    width={240}
                    height={160}
                    loading="lazy"
                    className="h-20 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
            <button
              type="button"
              onClick={() => void onLike(review)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${
                review.userLiked
                  ? "border-rose-300/40 bg-rose-500/10 text-rose-200"
                  : "border-border/70 bg-black/20 text-muted hover:text-text"
              }`}
              aria-label={`Like review by ${review.customerName}`}
            >
              <Heart className={`h-3.5 w-3.5 ${review.userLiked ? "fill-current" : ""}`} />
              <span>{review.likes}</span>
            </button>

            <button
              type="button"
              onClick={() => void onShare(review)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-black/20 px-3 py-1.5 text-xs text-muted transition hover:text-text"
              aria-label={`Share review by ${review.customerName}`}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>

            <button
              type="button"
              onClick={() => void onReport(review)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-black/20 px-3 py-1.5 text-xs text-muted transition hover:text-text"
              aria-label={`Report review by ${review.customerName}`}
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>

          {review.reply ? (
            <motion.div
              className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-500/10 p-3"
              initial={{opacity: 0, y: 8}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.25}}
            >
              <div className="flex items-center gap-2 text-sm text-sky-100">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold">{review.reply.authorName}</span>
                <span className="rounded-full border border-sky-200/30 px-2 py-0.5 text-[11px]">{review.reply.authorRole}</span>
              </div>
              <p className="mt-2 text-sm text-sky-50">{review.reply.message}</p>
              <p className="mt-2 text-xs text-sky-200/80">{new Date(review.reply.replyDate).toLocaleDateString()}</p>
            </motion.div>
          ) : null}
        </motion.article>
      ))}
    </div>
  );
}
