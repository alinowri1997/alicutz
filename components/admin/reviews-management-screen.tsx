"use client";

import * as React from "react";
import Image from "next/image";
import {AnimatePresence, motion} from "framer-motion";
import {
  Ban,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Languages,
  Mail,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import {AdminCard, PageHeader} from "@/components/admin";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {cn} from "@/lib/utils";
import type {AdminReviewListResponse, ReviewDocument, ReviewImage, ReviewRating, ReviewService, ReviewStatus} from "@/lib/types/reviews";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
const RATING_FILTERS = ["all", 1, 2, 3, 4, 5] as const;
const SORT_OPTIONS = [
  {value: "newest", label: "Newest"},
  {value: "oldest", label: "Oldest"},
  {value: "highestRated", label: "Highest Rated"},
  {value: "mostHelpful", label: "Most Helpful"},
] as const;
const SERVICE_FILTERS: Array<"all" | ReviewService> = ["all", "Haircut", "Fade", "Color", "Beard", "Home Service", "Other"];

interface AdminReviewsFilters {
  status: (typeof STATUS_FILTERS)[number];
  rating: (typeof RATING_FILTERS)[number];
  service: "all" | ReviewService;
  language: "all" | string;
  sort: (typeof SORT_OPTIONS)[number]["value"];
  startDate: string;
  endDate: string;
}

interface LightboxState {
  reviewId: string;
  imageIndex: number;
}

interface EditDrafts {
  reply: string;
}

function emptyDashboard(): AdminReviewListResponse["dashboard"] {
  return {
    pendingReviews: 0,
    approvedReviews: 0,
    hiddenReviews: 0,
    featuredReviews: 0,
    averageRating: 0,
    reviewGrowth: 0,
    mostPopularService: "N/A",
    mostActiveMonth: "N/A",
    customerSatisfaction: 0,
  };
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: string | undefined, fallback = "—"): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(value: string | undefined, fallback = "—"): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function starString(rating: ReviewRating): string {
  return "★".repeat(rating).padEnd(5, "☆");
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AC";
}

function getStatusTone(status: ReviewStatus): string {
  if (status === "approved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "pending") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }

  if (status === "rejected") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-200";
  }

  return "border-white/15 bg-white/5 text-text";
}

function isSuspicious(review: ReviewDocument): boolean {
  const compact = normalize(review.review);
  const words = compact.split(" ").filter(Boolean);
  const uniqueWords = new Set(words);
  return review.spamScore > 0 || review.reportedCount > 0 || review.review.length < 35 || (words.length > 12 && uniqueWords.size <= 3);
}

function getPhotoStatusLabel(image: ReviewImage): string {
  return image.approved === false ? "Pending" : "Approved";
}

async function fetchAdminReviews(): Promise<AdminReviewListResponse> {
  const response = await fetch("/api/admin/reviews?status=all&limit=200", {cache: "no-store"});
  const payload = (await response.json()) as {
    success: boolean;
    data?: AdminReviewListResponse;
    message?: string;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message ?? "Failed to fetch reviews.");
  }

  return payload.data;
}

function applyFilters(reviews: ReviewDocument[], filters: AdminReviewsFilters, search: string): ReviewDocument[] {
  const normalizedSearch = normalize(search);
  const startDate = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
  const endDate = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : null;

  const matchesSearch = (review: ReviewDocument): boolean => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = normalize([
      review.customerName,
      review.email,
      review.review,
      review.service,
      review.language,
      review.tags.join(" "),
    ].join(" "));

    return haystack.includes(normalizedSearch);
  };

  let next = reviews.filter((review) => {
    if (filters.status !== "all" && review.status !== filters.status) {
      return false;
    }

    if (filters.rating !== "all" && review.rating !== filters.rating) {
      return false;
    }

    if (filters.service !== "all" && review.service !== filters.service) {
      return false;
    }

    if (filters.language !== "all" && review.languageCode !== filters.language) {
      return false;
    }

    const createdAt = new Date(review.createdAt);
    if (startDate && createdAt < startDate) {
      return false;
    }

    if (endDate && createdAt > endDate) {
      return false;
    }

    return matchesSearch(review);
  });

  next = [...next];
  switch (filters.sort) {
    case "oldest":
      next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "highestRated":
      next.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "mostHelpful":
      next.sort((a, b) => b.helpfulVotes - a.helpfulVotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return next;
}

function buildMetrics(reviews: ReviewDocument[]): {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  reviewsThisWeek: number;
} {
  const now = Date.now();
  const weekAgo = now - 1000 * 60 * 60 * 24 * 7;

  let pendingReviews = 0;
  let approvedReviews = 0;
  let rejectedReviews = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  let reviewsThisWeek = 0;

  for (const review of reviews) {
    if (review.status === "pending") pendingReviews += 1;
    if (review.status === "approved") approvedReviews += 1;
    if (review.status === "rejected") rejectedReviews += 1;

    if (review.status === "approved") {
      ratingSum += review.rating;
      ratedCount += 1;
    }

    if (new Date(review.createdAt).getTime() >= weekAgo) {
      reviewsThisWeek += 1;
    }
  }

  return {
    totalReviews: reviews.length,
    pendingReviews,
    approvedReviews,
    rejectedReviews,
    averageRating: ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : 0,
    reviewsThisWeek,
  };
}

function buildCounts<T extends string>(items: T[], mapper: (item: T) => string): Array<{label: string; value: number}> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = mapper(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({label, value}))
    .sort((a, b) => b.value - a.value);
}

function exportReviewsCsv(reviews: ReviewDocument[]): void {
  const rows = [
    ["Customer", "Email", "Rating", "Service", "Language", "Visit Date", "Created At", "Status", "Helpful Votes", "Not Helpful Votes", "Review"],
    ...reviews.map((review) => [
      review.customerName,
      review.email,
      String(review.rating),
      review.service,
      review.language,
      review.visitDate ?? "",
      review.createdAt,
      review.status,
      String(review.helpfulVotes),
      String(review.notHelpfulVotes),
      review.review.replace(/\s+/g, " ").trim(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `alicutz-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "accent";
  disabled?: boolean;
}): React.JSX.Element {
  const tone =
    variant === "danger"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
      : variant === "accent"
        ? "border-[#d4af37]/30 bg-[#d4af37]/12 text-[#f7e5a3] hover:bg-[#d4af37]/18"
        : "border-white/10 bg-white/5 text-text hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        tone,
      )}
    >
      {children}
    </button>
  );
}

function ReviewStars({rating}: {rating: ReviewRating}): React.JSX.Element {
  return <span aria-label={`${rating} star rating`} className="text-amber-300">{starString(rating)}</span>;
}

export function ReviewsManagementScreen(): React.JSX.Element {
  const [data, setData] = React.useState<AdminReviewListResponse>({dashboard: emptyDashboard(), reviews: [], total: 0});
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [filters, setFilters] = React.useState<AdminReviewsFilters>({
    status: "all",
    rating: "all",
    service: "all",
    language: "all",
    sort: "newest",
    startDate: "",
    endDate: "",
  });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [activeReviewId, setActiveReviewId] = React.useState<string | null>(null);
  const [lightbox, setLightbox] = React.useState<LightboxState | null>(null);
  const [drafts, setDrafts] = React.useState<Record<string, EditDrafts>>({});

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const next = await fetchAdminReviews();
      setData(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setActiveReviewId(null);
        setLightbox(null);
      }

      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        const searchInput = document.getElementById("admin-reviews-search");
        searchInput?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const reviews = React.useMemo(() => applyFilters(data.reviews, filters, deferredSearch), [data.reviews, deferredSearch, filters]);
  const metrics = React.useMemo(() => buildMetrics(data.reviews), [data.reviews]);
  const languageOptions = React.useMemo(() => Array.from(new Set(data.reviews.map((review) => review.languageCode))).sort(), [data.reviews]);
  const tags = React.useMemo(() => buildCounts(data.reviews.flatMap((review) => review.tags), (tag) => tag), [data.reviews]);
  const services = React.useMemo(() => buildCounts(data.reviews.map((review) => review.service), (service) => service), [data.reviews]);
  const languages = React.useMemo(() => buildCounts(data.reviews.map((review) => review.language), (language) => language), [data.reviews]);
  const months = React.useMemo(() => buildCounts(data.reviews.map((review) => new Intl.DateTimeFormat(undefined, {month: "short", year: "numeric"}).format(new Date(review.createdAt))), (month) => month), [data.reviews]);

  const activeReview = React.useMemo(() => data.reviews.find((review) => review.id === activeReviewId) ?? null, [activeReviewId, data.reviews]);
  const activeReplyDraft = activeReview ? drafts[activeReview.id]?.reply ?? "" : "";

  const duplicateGroups = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const review of data.reviews) {
      const key = normalize(`${review.customerName}-${review.review}`);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [data.reviews]);

  const selectedReviews = React.useMemo(() => data.reviews.filter((review) => selectedIds.has(review.id)), [data.reviews, selectedIds]);

  const openReview = (review: ReviewDocument): void => {
    setActiveReviewId(review.id);
    setDrafts((current) => ({
      ...current,
      [review.id]: {
        reply: review.reply?.message ?? current[review.id]?.reply ?? "",
      },
    }));
  };

  const applyAction = React.useCallback(async (reviewId: string, action: string, payload?: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: {"Content-Type": "application/json"},
      body: action === "delete" ? undefined : JSON.stringify({action, payload}),
    });

    if (!response.ok) {
      throw new Error("Unable to complete moderation action.");
    }

    await load();
  }, [load]);

  const updateReplyDraft = (reviewId: string, reply: string): void => {
    setDrafts((current) => ({
      ...current,
      [reviewId]: {reply},
    }));
  };

  const toggleSelection = (reviewId: string): void => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    setSelectedIds((current) => {
      if (current.size === reviews.length) {
        return new Set();
      }
      return new Set(reviews.map((review) => review.id));
    });
  };

  const exportCurrentCsv = (): void => {
    exportReviewsCsv(selectedReviews.length > 0 ? selectedReviews : reviews);
  };

  const bulkModerate = async (action: "approve" | "reject" | "delete"): Promise<void> => {
    const targets = selectedReviews.length > 0 ? selectedReviews : reviews;
    if (targets.length === 0) {
      return;
    }

    if (action === "delete" && !window.confirm(`Delete ${targets.length} review${targets.length === 1 ? "" : "s"}?`)) {
      return;
    }

    await Promise.all(targets.map((review) => applyAction(review.id, action)));
    setSelectedIds(new Set());
  };

  const activePhoto = activeReview && activeReview.images.length > 0 ? activeReview.images[Math.max(0, lightbox?.imageIndex ?? 0)] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        section="Reviews"
        title="Reviews Management"
        description="Moderate every review with a premium workflow for approvals, replies, photo handling, and quality control."
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={exportCurrentCsv} variant="accent">
              <Download className="h-4 w-4" />
              Export CSV
            </ActionButton>
            <ActionButton onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </ActionButton>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          {label: "Total Reviews", value: metrics.totalReviews},
          {label: "Pending Reviews", value: metrics.pendingReviews},
          {label: "Approved Reviews", value: metrics.approvedReviews},
          {label: "Rejected Reviews", value: metrics.rejectedReviews},
          {label: "Average Rating", value: metrics.averageRating.toFixed(1)},
          {label: "Reviews This Week", value: metrics.reviewsThisWeek},
        ].map((card) => (
          <AdminCard key={card.label} title={card.label}>
            <p className="text-3xl font-semibold text-text">{card.value}</p>
          </AdminCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminCard title="Reviews per Month">
          <div className="space-y-3">
            {months.slice(0, 6).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-[#d4af37]" style={{width: `${Math.min(100, item.value * 18)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Reviews by Service">
          <div className="space-y-3">
            {services.slice(0, 6).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-emerald-400" style={{width: `${Math.min(100, item.value * 18)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Most Used Tags">
          <div className="space-y-3">
            {tags.slice(0, 6).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-sky-400" style={{width: `${Math.min(100, item.value * 18)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Languages">
          <div className="space-y-3">
            {languages.slice(0, 6).map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-violet-400" style={{width: `${Math.min(100, item.value * 18)}%`}} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Filters" subtitle="Search by customer, email, or review text. Keyboard shortcut: /">
        <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <label className="space-y-1.5 xl:col-span-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Search</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background/60 px-3">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="admin-reviews-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Customer, email, or review text"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({...current, status: event.target.value as AdminReviewsFilters["status"]}))}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>{status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Rating</span>
            <select
              value={filters.rating}
              onChange={(event) => setFilters((current) => ({...current, rating: event.target.value === "all" ? "all" : Number(event.target.value) as ReviewRating}))}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
            >
              {RATING_FILTERS.map((rating) => (
                <option key={String(rating)} value={rating}>{rating === "all" ? "All" : `${rating} stars`}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Service</span>
            <select
              value={filters.service}
              onChange={(event) => setFilters((current) => ({...current, service: event.target.value as AdminReviewsFilters["service"]}))}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
            >
              {SERVICE_FILTERS.map((service) => (
                <option key={service} value={service}>{service === "all" ? "All" : service}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Language</span>
            <select
              value={filters.language}
              onChange={(event) => setFilters((current) => ({...current, language: event.target.value}))}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
            >
              <option value="all">All</option>
              {languageOptions.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Sort</span>
            <select
              value={filters.sort}
              onChange={(event) => setFilters((current) => ({...current, sort: event.target.value as AdminReviewsFilters["sort"]}))}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Date Range</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => setFilters((current) => ({...current, startDate: event.target.value}))}
                className="h-11 rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => setFilters((current) => ({...current, endDate: event.target.value}))}
                className="h-11 rounded-xl border border-border bg-background/60 px-3 text-sm text-text"
              />
            </div>
          </label>
        </div>
      </AdminCard>

      {selectedIds.size > 0 ? (
        <AdminCard title="Bulk Actions" subtitle={`${selectedIds.size} selected`}>
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => void bulkModerate("approve")} variant="accent">
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected
            </ActionButton>
            <ActionButton onClick={() => void bulkModerate("reject")}>
              <Ban className="h-4 w-4" />
              Reject Selected
            </ActionButton>
            <ActionButton onClick={() => void bulkModerate("delete")} variant="danger">
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </ActionButton>
            <ActionButton onClick={exportCurrentCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </ActionButton>
          </div>
        </AdminCard>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <AdminCard title="Review Table" subtitle={isLoading ? "Loading reviews..." : `${reviews.length} matching reviews`}>
          {errorMessage ? <p className="mb-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{errorMessage}</p> : null}

          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-live="polite">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/50 p-10 text-center">
              <p className="text-lg font-semibold text-text">No reviews match the current filters</p>
              <p className="mt-2 text-sm text-muted">Try changing the date range, search terms, or sorting.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <button
                      type="button"
                      aria-label="Select all visible reviews"
                      onClick={toggleSelectAll}
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-[11px] text-text"
                    >
                      {selectedIds.size === reviews.length && reviews.length > 0 ? "✓" : ""}
                    </button>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Helpful Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const duplicateKey = normalize(`${review.customerName}-${review.review}`);
                  const duplicateCount = duplicateGroups.get(duplicateKey) ?? 0;
                  const suspicious = isSuspicious(review) || duplicateCount > 1;
                  return (
                    <TableRow key={review.id} className={cn(review.id === activeReviewId ? "bg-white/5" : undefined)}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(review.id)}
                          onChange={() => toggleSelection(review.id)}
                          aria-label={`Select review by ${review.customerName}`}
                          className="h-4 w-4 rounded border-border bg-background text-[#d4af37]"
                        />
                      </TableCell>
                      <TableCell>
                        <button type="button" className="flex items-center gap-3 text-left" onClick={() => openReview(review)}>
                          {review.avatar ? (
                            <Image src={review.avatar} alt={`${review.customerName} avatar`} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af37]/15 text-xs font-semibold text-[#f6dd8b]">
                              {getInitials(review.customerName)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-text">{review.customerName}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                              <span>{review.email}</span>
                              {suspicious ? <Badge variant="outline" className="border-rose-400/20 text-rose-200">Suspicious</Badge> : null}
                            </div>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell><ReviewStars rating={review.rating} /></TableCell>
                      <TableCell>{review.service}</TableCell>
                      <TableCell>{review.language}</TableCell>
                      <TableCell>{formatDate(review.visitDate)}</TableCell>
                      <TableCell>{formatDateTime(review.createdAt)}</TableCell>
                      <TableCell><Badge variant="outline" className={getStatusTone(review.status)}>{review.status}</Badge></TableCell>
                      <TableCell>{review.images.length}</TableCell>
                      <TableCell>{review.helpfulVotes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </AdminCard>

        <div className="relative min-h-[30rem]">
          <AnimatePresence>
            {activeReview ? (
              <motion.aside
                key={activeReview.id}
                initial={{opacity: 0, x: 32}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: 32}}
                transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}
                className="sticky top-24 rounded-[28px] border border-border bg-surface p-5 shadow-[0_28px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Review Details</p>
                    <h3 className="mt-1 text-2xl font-semibold text-text">{activeReview.customerName}</h3>
                    <p className="mt-1 text-sm text-muted">{activeReview.email}</p>
                  </div>
                  <button type="button" onClick={() => setActiveReviewId(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-text">
                  <ReviewStars rating={activeReview.rating} />
                  <span className="text-muted">{activeReview.service}</span>
                  <span className="text-muted">•</span>
                  <span className="text-muted">{activeReview.language}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{activeReview.status}</Badge>
                  {activeReview.featured ? <Badge variant="outline" className="border-[#d4af37]/30 text-[#f6dd8b]">Featured</Badge> : null}
                  {activeReview.verified ? <Badge variant="outline" className="border-emerald-400/20 text-emerald-200">Verified</Badge> : null}
                  {isSuspicious(activeReview) ? <Badge variant="outline" className="border-rose-400/20 text-rose-200">Suspicious</Badge> : null}
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Full Review</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{activeReview.review}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-border bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Visit Date</p>
                    <p className="mt-1 text-text">{formatDate(activeReview.visitDate)}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Created At</p>
                    <p className="mt-1 text-text">{formatDateTime(activeReview.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Helpful</p>
                    <p className="mt-1 text-text">{activeReview.helpfulVotes}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted">Not Helpful</p>
                    <p className="mt-1 text-text">{activeReview.notHelpfulVotes}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeReview.tags.length > 0 ? activeReview.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    )) : <span className="text-sm text-muted">No tags</span>}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">Photos</p>
                      <p className="mt-1 text-sm text-text">{activeReview.images.length} uploaded photos</p>
                    </div>
                    <Badge variant="outline" className="border-white/15 text-muted">Firebase Storage ready</Badge>
                  </div>

                  {activeReview.images.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {activeReview.images.map((image, imageIndex) => (
                        <div key={image.path} className="space-y-2 rounded-2xl border border-border bg-background/50 p-2">
                          <button type="button" className="group relative overflow-hidden rounded-xl" onClick={() => setLightbox({reviewId: activeReview.id, imageIndex})}>
                            <Image src={image.url} alt={`Review photo ${imageIndex + 1}`} width={480} height={320} className="h-32 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                          </button>
                          <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                            <span>{getPhotoStatusLabel(image)}</span>
                            <span>{image.size ? `${Math.round(image.size / 1024)} KB` : "Image"}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <ActionButton
                              variant="accent"
                              onClick={() => void applyAction(activeReview.id, "edit", {
                                images: activeReview.images.map((candidate) => candidate.path === image.path ? {...candidate, approved: candidate.approved === false} : candidate),
                              })}
                            >
                              <CheckCheck className="h-4 w-4" />
                              {image.approved === false ? "Approve" : "Unapprove"}
                            </ActionButton>
                            <ActionButton variant="danger" onClick={() => void applyAction(activeReview.id, "deletePhoto", {path: image.path})}>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </ActionButton>
                            <ActionButton onClick={() => window.open(image.url, "_blank", "noopener,noreferrer") }>
                              <Download className="h-4 w-4" />
                              Download
                            </ActionButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted">No customer photos were uploaded for this review.</p>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Owner Reply</p>
                  <textarea
                    value={activeReplyDraft}
                    onChange={(event) => updateReplyDraft(activeReview.id, event.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-text outline-none placeholder:text-muted"
                    placeholder="Write a premium reply to the customer..."
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      variant="accent"
                      onClick={() => void applyAction(activeReview.id, "edit", {
                        reply: {
                          authorName: "Ali Cutz",
                          authorRole: "Owner",
                          message: activeReplyDraft.trim(),
                          replyDate: new Date().toISOString(),
                        },
                      })}
                      disabled={!activeReplyDraft.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Save Reply
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => void applyAction(activeReview.id, "edit", {reply: null, replyDate: null})}
                      disabled={!activeReview.reply}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Reply
                    </ActionButton>
                  </div>

                  {activeReview.reply ? (
                    <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-sky-100">Current Reply</p>
                      <p className="mt-2 text-sm text-sky-50">{activeReview.reply.message}</p>
                      <p className="mt-2 text-xs text-sky-200">{formatDateTime(activeReview.reply.replyDate)}</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Future-ready metadata</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email: {activeReview.email}</div>
                    <div className="flex items-center gap-2"><Languages className="h-4 w-4" /> Language: {activeReview.languageCode}</div>
                    <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> IP / Browser: not stored yet</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton variant="accent" onClick={() => void applyAction(activeReview.id, "approve")}>
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </ActionButton>
                  <ActionButton onClick={() => void applyAction(activeReview.id, "reject")}>
                    <Ban className="h-4 w-4" />
                    Reject
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => void applyAction(activeReview.id, "delete")}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </ActionButton>
                  <ActionButton variant="accent" onClick={() => void applyAction(activeReview.id, "pin")}>
                    <PanelRightOpen className="h-4 w-4" />
                    Feature Review
                  </ActionButton>
                  <ActionButton variant="accent" onClick={() => void applyAction(activeReview.id, "pin")}>
                    <PanelRightClose className="h-4 w-4" />
                    Pin to Top
                  </ActionButton>
                </div>
              </motion.aside>
            ) : (
              <AdminCard title="Review details" subtitle="Select a review to open the premium side panel.">
                <div className="flex min-h-[32rem] items-center justify-center rounded-2xl border border-dashed border-border bg-background/40 p-8 text-center">
                  <div className="max-w-sm space-y-3">
                    <p className="text-lg font-semibold text-text">No review selected</p>
                    <p className="text-sm text-muted">Click a review row to inspect photos, reply from the owner account, and move it through moderation.</p>
                  </div>
                </div>
              </AdminCard>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activePhoto && activeReview ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <button type="button" className="absolute inset-0" aria-label="Close photo viewer" onClick={() => setLightbox(null)} />
            <div className="relative z-[121] w-full max-w-5xl rounded-[28px] border border-white/10 bg-[#090909] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between gap-3 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Photo viewer</p>
                  <p className="text-sm text-text">{activeReview.customerName}</p>
                </div>
                <button type="button" onClick={() => setLightbox(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setLightbox((current) => current && activeReview ? {...current, imageIndex: (current.imageIndex - 1 + activeReview.images.length) % activeReview.images.length} : current)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-text"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <Image
                  src={activePhoto.url}
                  alt="Expanded review photo"
                  width={1600}
                  height={1200}
                  className="max-h-[78vh] w-auto rounded-[24px] object-contain"
                />
                <button
                  type="button"
                  onClick={() => setLightbox((current) => current && activeReview ? {...current, imageIndex: (current.imageIndex + 1) % activeReview.images.length} : current)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-text"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
