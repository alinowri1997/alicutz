"use client";

import * as React from "react";
import {AnimatePresence, motion, useInView, useReducedMotion} from "framer-motion";
import {Star, PencilLine} from "lucide-react";

import {ReviewForm} from "@/components/reviews/review-form-premium";
import {ReviewsList} from "@/components/reviews/reviews-list-premium";
import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {Heading} from "@/components/ui/heading";
import type {PublicReview, ReviewListResponse, ReviewRating} from "@/lib/types/reviews";

const STAR_LABELS = [5, 4, 3, 2, 1] as const;
const INITIAL_LIMIT = 3;

function buildQuery(page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(INITIAL_LIMIT));
  params.set("sort", "newest");
  return params.toString();
}

function buildReviewSchema(stats: ReviewListResponse["stats"], reviews: PublicReview[]): Record<string, unknown> | null {
  if (stats.totalReviews === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Ali Cutz Premium Barber Service",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.averageRating,
      reviewCount: stats.totalReviews,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
      author: {
        "@type": "Person",
        name: review.customerName,
      },
      reviewBody: review.review,
      datePublished: review.createdAt,
      publisher: {
        "@type": "Organization",
        name: "Ali Cutz",
      },
    })),
  };
}

function AnimatedCount({value, suffix = "", decimals = 0, trigger}: {value: number; suffix?: string; decimals?: number; trigger: boolean}): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(reducedMotion ? value : 0);

  React.useEffect(() => {
    if (reducedMotion || !trigger) {
      const frame = window.requestAnimationFrame(() => setDisplayValue(value));
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 900;

    const step = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = value * eased;
      setDisplayValue(decimals > 0 ? Number(nextValue.toFixed(decimals)) : Math.round(nextValue));

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [decimals, reducedMotion, trigger, value]);

  return (
    <span>
      {displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

function SummaryCard({
  stats,
  isLoading,
  onWriteReview,
}: {
  stats: ReviewListResponse["stats"];
  isLoading: boolean;
  onWriteReview: () => void;
}): React.JSX.Element {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {once: true, margin: "-10%"});

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-border/70 bg-white/[0.02] p-5 sm:p-6">
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 space-y-3">
          <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <div className="rounded-[28px] border border-border/70 bg-white/[0.02] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">No reviews yet</p>
        <p className="mt-3 text-sm leading-6 text-muted">Be the first client to leave a review.</p>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onWriteReview}
          className="mt-5 w-full rounded-full border border-[#d7b36a]/45 bg-transparent text-text transition-all duration-300 hover:border-[#e6ca84] hover:bg-[#d7b36a]/8 hover:shadow-[0_0_0_1px_rgba(215,179,106,0.22),0_0_24px_rgba(215,179,106,0.12)]"
        >
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Write a Review
        </Button>
      </div>
    );
  }

  return (
    <div ref={ref} className="grid gap-5 rounded-[28px] border border-border/70 bg-white/[0.02] p-5 sm:p-6 lg:grid-cols-[240px_1fr] lg:items-start">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Average Rating</p>
          <div className="flex items-end gap-3">
            <p className="text-5xl font-semibold tracking-[-0.05em] text-text">
              <AnimatedCount value={stats.averageRating} decimals={1} trigger={inView} />
            </p>
            <div className="pb-2 text-[#d7b36a]">★★★★★</div>
          </div>
        </div>

        <div className="rounded-[22px] border border-border/70 bg-background/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Total Reviews</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-text">
            <AnimatedCount value={stats.totalReviews} trigger={inView} />
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onWriteReview}
          className="w-full rounded-full border border-[#d7b36a]/45 bg-transparent text-text transition-all duration-300 hover:border-[#e6ca84] hover:bg-[#d7b36a]/8 hover:shadow-[0_0_0_1px_rgba(215,179,106,0.22),0_0_24px_rgba(215,179,106,0.12)]"
        >
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Write a Review
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Rating distribution</p>
          <span className="text-xs text-muted">Animated on scroll</span>
        </div>
        <div className="space-y-2">
          {STAR_LABELS.map((star) => {
            const total = Math.max(1, stats.totalReviews);
            const count = stats.ratingDistribution[star as ReviewRating];
            const percent = Math.max(3, Math.round((count / total) * 100));

            return (
              <div key={star} className="grid grid-cols-[24px_1fr_34px] items-center gap-3 text-xs text-muted">
                <span className="text-right text-text">{star}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-[#d7b36a]"
                    initial={{scaleX: 0, transformOrigin: "left"}}
                    animate={inView ? {scaleX: percent / 100} : {scaleX: 0}}
                    transition={{duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (5 - star) * 0.05}}
                  />
                </div>
                <span className="text-right tabular-nums text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyToast({message}: {message: string | null}): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 z-[140] w-[min(92vw,28rem)] -translate-x-1/2 rounded-[24px] border border-white/10 bg-black/90 px-4 py-3 text-sm text-text shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md"
      initial={{opacity: 0, y: 14}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: 14}}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d7b36a]/15 text-[#e8c97c]">
          <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium text-text">Thank you!</p>
          <p className="mt-1 text-muted">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Header({stats, isLoading}: {stats: ReviewListResponse["stats"]; isLoading: boolean}): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-52 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-44 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  if (stats.totalReviews === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Client Reviews</p>
        <Heading as="h2" size="h2" className="max-w-[18ch] text-balance">
          Client Reviews
        </Heading>
        <p className="type-body max-w-[38ch] text-muted">Be the first client to share your experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#d7b36a]">
        <span aria-hidden="true">★★★★★</span>
        <span className="text-sm text-text">
          <AnimatedCount value={stats.averageRating} decimals={1} trigger={true} />
        </span>
      </div>
      <Heading as="h2" size="h2" className="max-w-[18ch] text-balance">
        Client Reviews
      </Heading>
      <p className="type-body max-w-[38ch] text-muted">Trusted by our clients</p>
    </div>
  );
}

interface ReviewsSectionProps {
  initialFormOpen?: boolean;
  onReviewSubmitted?: () => void;
}

export function ReviewsSection({initialFormOpen = false, onReviewSubmitted}: ReviewsSectionProps = {}): React.JSX.Element {
  const [reviews, setReviews] = React.useState<PublicReview[]>([]);
  const [stats, setStats] = React.useState<ReviewListResponse["stats"]>({
    averageRating: 0,
    totalReviews: 0,
    recommendationPercentage: 0,
    ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
    verifiedReviews: 0,
    withPhotos: 0,
  });
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(initialFormOpen);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const loadReviews = React.useCallback(async (targetPage: number, append: boolean): Promise<void> => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(`/api/reviews?${buildQuery(targetPage)}`, {cache: "no-store"});
      const payload = (await response.json()) as {success: boolean; data?: ReviewListResponse; message?: string};

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Failed to fetch reviews.");
      }

      setStats(payload.data.stats);
      setHasMore(payload.data.hasMore);
      setPage(payload.data.page);
      setReviews((current) => (append ? [...current, ...payload.data!.reviews] : payload.data!.reviews));
    } catch (error) {
      console.error("Failed to load reviews", error);
      if (!append) {
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadReviews(1, false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadReviews]);

  React.useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const schemaJson = React.useMemo(() => buildReviewSchema(stats, reviews), [stats, reviews]);

  return (
    <section id="reviews" className="relative overflow-hidden py-16 sm:py-20" aria-labelledby="reviews-heading">
      {schemaJson ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schemaJson)}} /> : null}

      <Container className="space-y-6">
        <Header stats={stats} isLoading={isLoading} />

        <SummaryCard stats={stats} isLoading={isLoading} onWriteReview={() => setFormOpen(true)} />

        <div className="space-y-4 rounded-[28px] border border-border/70 bg-white/[0.02] p-4 sm:p-5">
          <ReviewsList reviews={reviews} isLoading={isLoading} />

          {hasMore ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => void loadReviews(page + 1, true)}
              isLoading={isLoadingMore}
              className="w-full rounded-full border border-border/70 bg-transparent text-text transition-all duration-300 hover:border-[#d7b36a]/45 hover:bg-[#d7b36a]/8 hover:shadow-[0_0_0_1px_rgba(215,179,106,0.12),0_0_24px_rgba(215,179,106,0.08)]"
            >
              Show more reviews
            </Button>
          ) : null}
        </div>
      </Container>

      <ReviewForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmitted={() => {
          setToastMessage("Your review has been submitted. It will appear after approval.");
          onReviewSubmitted?.();
          void loadReviews(1, false);
        }}
      />

      <AnimatePresence>{toastMessage ? <EmptyToast message={toastMessage} /> : null}</AnimatePresence>
    </section>
  );
}
