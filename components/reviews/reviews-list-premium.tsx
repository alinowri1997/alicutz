"use client";

import * as React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {BadgeCheck, HandHelping, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp} from "lucide-react";

import type {PublicReview, ReviewVote} from "@/lib/types/reviews";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils";

interface ReviewsListProps {
  reviews: PublicReview[];
  isLoading: boolean;
  onVote: (review: PublicReview, vote: ReviewVote) => Promise<void> | void;
  onReport: (review: PublicReview) => Promise<void>;
  onShare: (review: PublicReview) => Promise<void>;
  onOpenImage: (reviewIndex: number, imageIndex: number) => void;
}

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AC"
  );
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

const VOTE_COPY: Record<ReviewVote, string> = {
  helpful: "Helpful",
  notHelpful: "Not Helpful",
};

export function ReviewsList({reviews, isLoading, onVote, onReport, onShare, onOpenImage}: ReviewsListProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="flex gap-2">
                <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
            <Sparkles className="h-5 w-5 text-muted" aria-hidden="true" />
          </div>
          <h3 className="type-h5 text-text">No reviews matched these filters</h3>
          <p className="type-small max-w-[42ch] text-muted">Try another service, update the sort order, or search with fewer keywords.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {reviews.map((review, reviewIndex) => (
        <motion.article
          key={review.id}
          className="overflow-hidden rounded-[28px] border border-border/70 bg-white/[0.045] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-md"
          initial={{opacity: 0, y: 14}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.2}}
          transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
        >
          <div className="p-5 sm:p-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <Image src={review.avatar} alt={`${review.customerName} avatar`} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-text">
                    {initials(review.customerName)}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="type-h6 text-text">{review.customerName}</p>
                    {review.verified ? (
                      <Badge variant="default" className="gap-1">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Verified badge ready
                      </Badge>
                    )}
                  </div>
                  <p className="type-small text-muted">{review.service} • {review.language} • {review.status} • {formatVisitDate(review.visitDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-text">
                <Sparkles className="h-4 w-4 text-[#f4cb63]" aria-hidden="true" />
                <span>{review.rating}.0</span>
              </div>
            </header>

            <div className="mt-4 flex flex-wrap gap-2">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-background/70">
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#e8e8e8]">{review.review}</p>

            {review.images.length > 0 ? (
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {review.images.slice(0, 3).map((image, imageIndex) => (
                  <button
                    key={`${review.id}-${image.path}`}
                    type="button"
                    className="group relative overflow-hidden rounded-2xl border border-border/70"
                    onClick={() => onOpenImage(reviewIndex, imageIndex)}
                    aria-label={`Open review image ${imageIndex + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt={`${review.customerName} uploaded review image ${imageIndex + 1}`}
                      width={240}
                      height={160}
                      loading="lazy"
                      className="h-24 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <VoteButton
                  vote="helpful"
                  active={review.userVote === "helpful"}
                  count={review.helpfulVotes}
                  onClick={() => void onVote(review, "helpful")}
                />
                <VoteButton
                  vote="notHelpful"
                  active={review.userVote === "notHelpful"}
                  count={review.notHelpfulVotes}
                  onClick={() => void onVote(review, "notHelpful")}
                />
                <Button variant="secondary" size="sm" onClick={() => void onShare(review)}>
                  Share
                </Button>
                <Button variant="secondary" size="sm" onClick={() => void onReport(review)}>
                  Report
                </Button>
              </div>

              {review.reply ? (
                <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm text-sky-50">
                  <div className="flex items-center gap-2">
                    <HandHelping className="h-4 w-4" aria-hidden="true" />
                    <span className="font-semibold">{review.reply.authorName}</span>
                    <span className="rounded-full border border-sky-200/30 px-2 py-0.5 text-[11px]">{review.reply.authorRole}</span>
                  </div>
                  <p className="mt-2">{review.reply.message}</p>
                  <p className="mt-2 text-xs text-sky-200/80">{new Date(review.reply.replyDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-background/70 p-3 text-sm text-muted">
                  Owner response space is ready. Reply architecture can attach here later without changing the card layout.
                </div>
              )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function VoteButton({vote, active, count, onClick}: {vote: ReviewVote; active: boolean; count: number; onClick: () => void}): React.JSX.Element {
  const Icon = vote === "helpful" ? ThumbsUp : ThumbsDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active ? "border-accent bg-accent text-accent-foreground shadow-[0_12px_24px_rgba(0,0,0,0.24)]" : "border-border bg-background/80 text-muted hover:border-white/25 hover:text-text",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{VOTE_COPY[vote]}</span>
      <span className="rounded-full border border-current/20 bg-black/10 px-2 py-0.5 text-[11px]">{count}</span>
    </button>
  );
}
