"use client";

import * as React from "react";

import {ReviewForm} from "@/components/reviews/review-form-premium";
import {ReviewsList} from "@/components/reviews/reviews-list-premium";
import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {Heading} from "@/components/ui/heading";
import type {PublicReview, ReviewListResponse} from "@/lib/types/reviews";

const STAR_LABELS = [5, 4, 3, 2, 1] as const;

function buildQuery(page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "3");
  params.set("sort", "newest");
  return params.toString();
}

function buildReviewSchema(stats: ReviewListResponse["stats"], reviews: PublicReview[]): Record<string, unknown> {
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

export function ReviewsSection(): React.JSX.Element {
  const [reviews, setReviews] = React.useState<PublicReview[]>([]);
  const [stats, setStats] = React.useState<ReviewListResponse["stats"]>({
    averageRating: 4.9,
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
  const [formOpen, setFormOpen] = React.useState(false);

  const loadReviews = React.useCallback(async (targetPage: number, append: boolean): Promise<void> => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(`/api/reviews?${buildQuery(targetPage)}`, {cache: "no-store"});
      const payload = (await response.json()) as {
        success: boolean;
        data?: ReviewListResponse;
        message?: string;
      };

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

  const schemaJson = React.useMemo(() => JSON.stringify(buildReviewSchema(stats, reviews)), [stats, reviews]);

  return (
    <section id="reviews" className="relative overflow-hidden py-16 sm:py-20" aria-labelledby="reviews-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schemaJson}} />

      <Container className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm tracking-[0.08em] text-[#d7b36a]">★★★★★ 4.9</p>
              <p className="text-sm text-muted">Based on {stats.totalReviews} reviews</p>
              <Heading id="reviews-heading" as="h2" size="h3" className="text-balance text-text">
                Read what our clients say
              </Heading>
            </div>

            <Button variant="secondary" size="md" onClick={() => setFormOpen(true)}>
              Write a review
            </Button>
          </div>

          <div className="grid gap-4 rounded-3xl border border-border/70 bg-white/[0.02] p-4 sm:p-5 lg:grid-cols-[260px_1fr] lg:items-start">
            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/60 p-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-[-0.04em] text-text">{stats.averageRating.toFixed(1)}</span>
                <span className="pb-1 text-sm text-muted">/ 5</span>
              </div>
              <p className="text-sm text-muted">{stats.totalReviews} Google-style client reviews</p>
              <div className="space-y-1.5">
                {STAR_LABELS.map((star) => {
                  const total = Math.max(1, stats.totalReviews);
                  const count = stats.ratingDistribution[star];
                  const width = `${Math.max(4, Math.round((count / total) * 100))}%`;

                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-muted">
                      <span className="w-3 text-right">{star}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                        <span className="block h-full rounded-full bg-[#d7b36a]" style={{width}} />
                      </span>
                      <span className="w-8 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <ReviewsList reviews={reviews} isLoading={isLoading} />
          </div>
        </header>

        {hasMore ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void loadReviews(page + 1, true)}
            isLoading={isLoadingMore}
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? "Loading..." : "Show more reviews"}
          </Button>
        ) : null}
      </Container>

      <ReviewForm open={formOpen} onOpenChange={setFormOpen} onReviewSubmitted={() => void loadReviews(1, false)} />
    </section>
  );
}
