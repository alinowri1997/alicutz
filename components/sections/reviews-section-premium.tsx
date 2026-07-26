"use client";

import * as React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {Search, Sparkles, X} from "lucide-react";

import {ReviewForm} from "@/components/reviews/review-form-premium";
import {ReviewsList} from "@/components/reviews/reviews-list-premium";
import {ReviewStats} from "@/components/reviews/review-stats-premium";
import {Button} from "@/components/ui/button";
import {Container} from "@/components/ui/container";
import {Heading} from "@/components/ui/heading";
import type {PublicReview, ReviewListResponse, ReviewService, ReviewVote, ReviewSort} from "@/lib/types/reviews";

const SORT_OPTIONS: Array<{label: string; value: ReviewSort}> = [
  {label: "Newest", value: "newest"},
  {label: "Oldest", value: "oldest"},
  {label: "Highest Rated", value: "highestRating"},
  {label: "Most Helpful", value: "mostHelpful"},
];

const SERVICE_FILTERS: Array<{label: string; value: "all" | ReviewService}> = [
  {label: "All services", value: "all"},
  {label: "Haircut", value: "Haircut"},
  {label: "Fade", value: "Fade"},
  {label: "Beard", value: "Beard"},
  {label: "Color", value: "Color"},
  {label: "Home Service", value: "Home Service"},
  {label: "Other", value: "Other"},
];

function buildQuery(page: number, search: string, sort: ReviewSort, service: "all" | ReviewService): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "8");
  params.set("sort", sort);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (service !== "all") {
    params.set("service", service);
  }

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

const VOTE_STORAGE_KEY = "alicutz.review-votes";

export function ReviewsSection(): React.JSX.Element {
  const [reviews, setReviews] = React.useState<PublicReview[]>([]);
  const [stats, setStats] = React.useState<ReviewListResponse["stats"]>({
    averageRating: 0,
    totalReviews: 0,
    recommendationPercentage: 0,
    ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
    verifiedReviews: 0,
    withPhotos: 0,
  });
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<ReviewSort>("newest");
  const [service, setService] = React.useState<"all" | ReviewService>("all");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [lightbox, setLightbox] = React.useState<{reviewIndex: number; imageIndex: number} | null>(null);
  const [votes, setVotes] = React.useState<Record<string, ReviewVote>>({});
  const deferredSearch = React.useDeferredValue(search);
  const votesRef = React.useRef(votes);

  React.useEffect(() => {
    votesRef.current = votes;
  }, [votes]);

  React.useEffect(() => {
    const savedVotes = window.localStorage.getItem(VOTE_STORAGE_KEY);
    if (!savedVotes) {
      return;
    }

    try {
      votesRef.current = JSON.parse(savedVotes) as Record<string, ReviewVote>;
      setVotes(votesRef.current);
    } catch {
      window.localStorage.removeItem(VOTE_STORAGE_KEY);
    }
  }, []);

  const persistVotes = React.useCallback((nextVotes: Record<string, ReviewVote>) => {
    setVotes(nextVotes);
    window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(nextVotes));
  }, []);

  const loadReviews = React.useCallback(
    async (targetPage: number, append: boolean): Promise<void> => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const query = buildQuery(targetPage, deferredSearch, sort, service);
        const response = await fetch(`/api/reviews?${query}`, {cache: "no-store"});
        const payload = (await response.json()) as {success: boolean; data?: ReviewListResponse; message?: string};

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message ?? "Failed to fetch reviews.");
        }

        const nextReviews = payload.data.reviews.map((review) => ({
          ...review,
          userVote: votesRef.current[review.id] ?? null,
          userLiked: votesRef.current[review.id] === "helpful",
        }));

        setStats(payload.data.stats);
        setHasMore(payload.data.hasMore);
        setPage(payload.data.page);
        setReviews((current) => (append ? [...current, ...nextReviews] : nextReviews));
      } catch (error) {
        console.error("Failed to load reviews", error);
        if (!append) {
          setReviews([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [deferredSearch, service, sort],
  );

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadReviews(1, false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadReviews]);

  const schemaJson = React.useMemo(() => JSON.stringify(buildReviewSchema(stats, reviews)), [stats, reviews]);

  const selectedReview = lightbox ? reviews[lightbox.reviewIndex] : null;
  const selectedImage = selectedReview ? selectedReview.images[lightbox?.imageIndex ?? 0] : null;

  const onVote = async (review: PublicReview, vote: ReviewVote): Promise<void> => {
    const currentVotes = votesRef.current;

    if (currentVotes[review.id]) {
      return;
    }

    if (vote === "helpful") {
      const response = await fetch(`/api/reviews/${review.id}/likes`, {method: "POST"});
      const payload = (await response.json()) as {success: boolean; data?: {likes: number}; message?: string};
      if (!response.ok || !payload.success || !payload.data) {
        return;
      }

      setReviews((current) => current.map((item) => (item.id === review.id ? {...item, helpfulVotes: payload.data!.likes, likes: payload.data!.likes, userVote: vote, userLiked: true} : item)));
      persistVotes({...currentVotes, [review.id]: vote});
      return;
    }

    setReviews((current) => current.map((item) => (item.id === review.id ? {...item, notHelpfulVotes: item.notHelpfulVotes + 1, userVote: vote, userLiked: false} : item)));
    persistVotes({...currentVotes, [review.id]: vote});
  };

  const onReport = async (review: PublicReview): Promise<void> => {
    const reason = window.prompt("Why are you reporting this review?", "Spam");
    if (!reason) {
      return;
    }

    await fetch(`/api/reviews/${review.id}/flags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({reason}),
    });
  };

  const onShare = async (review: PublicReview): Promise<void> => {
    const text = `${review.customerName}: ${review.review}`;
    const url = typeof window !== "undefined" ? window.location.href : "https://alicutz.com";

    if (navigator.share) {
      await navigator.share({title: "Ali Cutz Review", text, url}).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
  };

  return (
    <section id="reviews" className="relative overflow-hidden py-16 sm:py-20 md:py-24" aria-labelledby="reviews-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schemaJson}} />
      <Container className="space-y-8">
        <motion.div
          className="space-y-4"
          initial={{opacity: 0, y: 18}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.2}}
          transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Client reputation</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading id="reviews-heading" as="h2" size="h2" className="max-w-[28ch] text-balance text-text">
              Premium reviews, refined for speed and trust
            </Heading>
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              See live feedback
            </Button>
          </div>
        </motion.div>

        <ReviewStats stats={stats} isLoading={isLoading} />

        <div className="rounded-[28px] border border-border/70 bg-white/[0.03] p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reviews"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
                aria-label="Search reviews"
              />
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
              className="h-12 rounded-2xl border border-border/70 bg-background/70 px-4 text-sm text-text outline-none"
              aria-label="Sort reviews"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={service}
              onChange={(event) => setService(event.target.value as "all" | ReviewService)}
              className="h-12 rounded-2xl border border-border/70 bg-background/70 px-4 text-sm text-text outline-none"
              aria-label="Filter by service"
            >
              {SERVICE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-4">
            <ReviewsList reviews={reviews} isLoading={isLoading} onVote={onVote} onReport={onReport} onShare={onShare} onOpenImage={(reviewIndex, imageIndex) => setLightbox({reviewIndex, imageIndex})} />

            {hasMore ? (
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => void loadReviews(page + 1, true)}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-border/70 bg-background/70 px-4 text-sm text-text transition hover:border-white/30 disabled:opacity-60"
              >
                {isLoadingMore ? "Loading more reviews..." : "Load more reviews"}
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <ReviewForm onReviewSubmitted={() => void loadReviews(1, false)} />
            <div className="rounded-[28px] border border-border/70 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Micro interactions</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>Smooth hover and loading feedback.</li>
                <li>Skeletons and empty-state transitions.</li>
                <li>Sticky submit on mobile for lower friction.</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {selectedReview && selectedImage ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3" role="dialog" aria-modal="true" aria-label="Review photo viewer">
          <button type="button" onClick={() => setLightbox(null)} className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/45 p-2 text-white" aria-label="Close photo viewer">
            <X className="h-4 w-4" />
          </button>

          <div className="flex w-full max-w-4xl items-center justify-center">
            <Image
              src={selectedImage.url}
              alt={`${selectedReview.customerName} customer photo`}
              width={1600}
              height={1200}
              className="max-h-[82vh] w-auto max-w-[90vw] rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
