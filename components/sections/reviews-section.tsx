"use client";

import * as React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {Search, X} from "lucide-react";

import {ReviewForm} from "@/components/reviews/review-form";
import {ReviewsList} from "@/components/reviews/reviews-list";
import {ReviewStats} from "@/components/reviews/review-stats";
import {Container} from "@/components/ui/container";
import {Heading} from "@/components/ui/heading";
import type {PublicReview, ReviewListResponse, ReviewService, ReviewSort} from "@/lib/types/reviews";

const FILTER_CHIPS = [
  "All",
  "Verified",
  "With Photos",
  "5★",
  "4★",
  "3★",
  "Newest",
  "Oldest",
  "Most Helpful",
  "Haircut",
  "Fade",
  "Color",
  "Beard",
  "Home Service",
] as const;

const SORT_OPTIONS: Array<{label: string; value: ReviewSort}> = [
  {label: "Newest", value: "newest"},
  {label: "Oldest", value: "oldest"},
  {label: "Highest Rating", value: "highestRating"},
  {label: "Lowest Rating", value: "lowestRating"},
  {label: "Most Helpful", value: "mostHelpful"},
  {label: "Most Liked", value: "mostLiked"},
];

const SERVICE_CHIPS = new Set<ReviewService>(["Haircut", "Fade", "Color", "Beard", "Home Service"]);

interface ReviewFilters {
  verified?: boolean;
  withPhotos?: boolean;
  rating?: number;
  service?: ReviewService;
  sort: ReviewSort;
}

function mapChipToFilter(chip: (typeof FILTER_CHIPS)[number], current: ReviewFilters): ReviewFilters {
  if (chip === "All") {
    return {sort: current.sort};
  }

  if (chip === "Verified") {
    return {...current, verified: !current.verified};
  }

  if (chip === "With Photos") {
    return {...current, withPhotos: !current.withPhotos};
  }

  if (chip === "5★" || chip === "4★" || chip === "3★") {
    const rating = Number(chip.replace("★", ""));
    return {...current, rating: current.rating === rating ? undefined : rating};
  }

  if (chip === "Newest") {
    return {...current, sort: "newest"};
  }

  if (chip === "Oldest") {
    return {...current, sort: "oldest"};
  }

  if (chip === "Most Helpful") {
    return {...current, sort: "mostHelpful"};
  }

  if (SERVICE_CHIPS.has(chip as ReviewService)) {
    const service = chip as ReviewService;
    return {...current, service: current.service === service ? undefined : service};
  }

  return current;
}

function buildQuery(page: number, search: string, filters: ReviewFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "8");
  params.set("sort", filters.sort);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (filters.verified) {
    params.set("verified", "true");
  }

  if (filters.withPhotos) {
    params.set("withPhotos", "true");
  }

  if (filters.rating) {
    params.set("rating", String(filters.rating));
  }

  if (filters.service) {
    params.set("service", filters.service);
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
  const [draftSearch, setDraftSearch] = React.useState("");
  const [filters, setFilters] = React.useState<ReviewFilters>({sort: "newest"});
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [lightbox, setLightbox] = React.useState<{reviewIndex: number; imageIndex: number} | null>(null);

  const loadReviews = React.useCallback(async (targetPage: number, append: boolean): Promise<void> => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const query = buildQuery(targetPage, search, filters);
      const response = await fetch(`/api/reviews?${query}`, {cache: "no-store"});
      const payload = (await response.json()) as {success: boolean; data?: ReviewListResponse; message?: string};

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Failed to fetch reviews.");
      }

      setStats(payload.data.stats);
      setHasMore(payload.data.hasMore);
      setPage(payload.data.page);

      if (append) {
        setReviews((current) => [...current, ...payload.data!.reviews]);
      } else {
        setReviews(payload.data.reviews);
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
      if (!append) {
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, search]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void loadReviews(1, false);
    });
  }, [loadReviews]);

  const schemaJson = React.useMemo(
    () => JSON.stringify(buildReviewSchema(stats, reviews)),
    [stats, reviews],
  );

  const selectedReview = lightbox ? reviews[lightbox.reviewIndex] : null;
  const selectedImage = selectedReview ? selectedReview.images[lightbox?.imageIndex ?? 0] : null;

  const nextImage = (): void => {
    if (!selectedReview || !lightbox) {
      return;
    }

    setLightbox({
      reviewIndex: lightbox.reviewIndex,
      imageIndex: (lightbox.imageIndex + 1) % selectedReview.images.length,
    });
  };

  const previousImage = (): void => {
    if (!selectedReview || !lightbox) {
      return;
    }

    setLightbox({
      reviewIndex: lightbox.reviewIndex,
      imageIndex: (lightbox.imageIndex - 1 + selectedReview.images.length) % selectedReview.images.length,
    });
  };

  const onLike = async (review: PublicReview): Promise<void> => {
    const method = review.userLiked ? "DELETE" : "POST";
    const response = await fetch(`/api/reviews/${review.id}/likes`, {method});
    const payload = (await response.json()) as {success: boolean; data?: {likes: number}; message?: string};

    if (!response.ok || !payload.success || !payload.data) {
      return;
    }

    setReviews((current) => current.map((item) => {
      if (item.id !== review.id) {
        return item;
      }

      return {
        ...item,
        likes: payload.data!.likes,
        userLiked: !item.userLiked,
      };
    }));
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
      await navigator.share({
        title: "Ali Cutz Review",
        text,
        url,
      }).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
  };

  const applySearch = (): void => {
    setSearch(draftSearch);
  };

  return (
    <section id="reviews" className="relative overflow-hidden py-16 sm:py-20 md:py-24" aria-labelledby="reviews-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: schemaJson}} />
      <Container className="space-y-8">
        <motion.div
          className="space-y-3"
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, amount: 0.2}}
          transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Client reputation</p>
          <Heading id="reviews-heading" as="h2" size="h2" className="max-w-[28ch] text-balance text-text">
            Premium reviews from local and international clients
          </Heading>
        </motion.div>

        <ReviewStats stats={stats} isLoading={isLoading} />

        <div className="rounded-[24px] border border-border/70 bg-white/[0.03] p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-black/20 px-3 py-2.5">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="Search by customer, review text, or service"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
                aria-label="Search reviews"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applySearch();
                  }
                }}
              />
              <button
                type="button"
                onClick={applySearch}
                className="rounded-lg border border-border/70 px-2.5 py-1 text-xs text-muted hover:text-text"
              >
                Search
              </button>
            </div>

            <select
              value={filters.sort}
              onChange={(event) => setFilters((current) => ({...current, sort: event.target.value as ReviewSort}))}
              className="h-10 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text"
              aria-label="Sort reviews"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active =
                (chip === "Verified" && filters.verified) ||
                (chip === "With Photos" && filters.withPhotos) ||
                ((chip === "5★" || chip === "4★" || chip === "3★") && filters.rating === Number(chip.replace("★", ""))) ||
                ((chip === "Haircut" || chip === "Fade" || chip === "Color" || chip === "Beard" || chip === "Home Service") && filters.service === chip) ||
                (chip === "Newest" && filters.sort === "newest") ||
                (chip === "Oldest" && filters.sort === "oldest") ||
                (chip === "Most Helpful" && filters.sort === "mostHelpful") ||
                (chip === "All" && !filters.verified && !filters.withPhotos && !filters.rating && !filters.service);

              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFilters((current) => mapChipToFilter(chip, current))}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-[#d4af37]/70 bg-[#d4af37]/15 text-[#f9de90]"
                      : "border-border/70 bg-black/20 text-muted hover:text-text"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-4">
            <ReviewsList
              reviews={reviews}
              isLoading={isLoading}
              onLike={onLike}
              onReport={onReport}
              onShare={onShare}
              onOpenImage={(reviewIndex, imageIndex) => setLightbox({reviewIndex, imageIndex})}
            />

            {hasMore ? (
              <button
                type="button"
                disabled={isLoadingMore}
                onClick={() => void loadReviews(page + 1, true)}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border/70 bg-black/20 px-4 text-sm text-text transition hover:border-white/30 disabled:opacity-60"
              >
                {isLoadingMore ? "Loading..." : "Load more reviews"}
              </button>
            ) : null}
          </div>

          <ReviewForm onReviewSubmitted={() => void loadReviews(1, false)} />
        </div>
      </Container>

      {selectedReview && selectedImage ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Review photo viewer"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/45 p-2 text-white"
            aria-label="Close photo viewer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex w-full max-w-4xl items-center justify-between gap-3">
            <button
              type="button"
              onClick={previousImage}
              className="rounded-full border border-white/20 bg-black/45 px-3 py-2 text-white"
              aria-label="Previous image"
            >
              Prev
            </button>

            <Image
              src={selectedImage.url}
              alt={`${selectedReview.customerName} customer photo`}
              width={1600}
              height={1200}
              className="max-h-[82vh] w-auto max-w-[84vw] rounded-2xl object-contain"
              onTouchStart={(event) => {
                const touch = event.changedTouches[0];
                event.currentTarget.dataset.touchX = String(touch.clientX);
              }}
              onTouchEnd={(event) => {
                const startX = Number(event.currentTarget.dataset.touchX ?? 0);
                const endX = event.changedTouches[0]?.clientX ?? 0;
                const delta = endX - startX;
                if (delta > 35) {
                  previousImage();
                } else if (delta < -35) {
                  nextImage();
                }
              }}
            />

            <button
              type="button"
              onClick={nextImage}
              className="rounded-full border border-white/20 bg-black/45 px-3 py-2 text-white"
              aria-label="Next image"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
