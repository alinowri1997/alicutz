"use client";

import * as React from "react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel} from "@/components/admin/modules/shared";
import type {AdminReviewListResponse, ReviewDocument} from "@/lib/types/reviews";

type StatusFilter = "all" | "pending" | "approved" | "hidden" | "rejected";

const ACTIONS = [
  {key: "approve", label: "Approve"},
  {key: "reject", label: "Reject"},
  {key: "hide", label: "Hide"},
  {key: "pin", label: "Pin"},
  {key: "verify", label: "Verify"},
] as const;

async function fetchAdminReviews(status: StatusFilter, search: string): Promise<AdminReviewListResponse> {
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("limit", "80");
  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`/api/admin/reviews?${params.toString()}`, {cache: "no-store"});
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

export function ReviewsManager(): React.JSX.Element {
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [draftReply, setDraftReply] = React.useState<Record<string, string>>({});
  const [draftEdit, setDraftEdit] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [data, setData] = React.useState<AdminReviewListResponse>({
    dashboard: {
      pendingReviews: 0,
      approvedReviews: 0,
      hiddenReviews: 0,
      featuredReviews: 0,
      averageRating: 0,
      reviewGrowth: 0,
      mostPopularService: "N/A",
      mostActiveMonth: "N/A",
      customerSatisfaction: 0,
    },
    reviews: [],
    total: 0,
  });

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const next = await fetchAdminReviews(status, search);
      setData(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const applyAction = async (
    reviewId: string,
    action: "approve" | "reject" | "hide" | "pin" | "verify" | "reply" | "edit" | "delete",
    payload?: Record<string, unknown>,
  ): Promise<void> => {
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: action === "delete" ? undefined : JSON.stringify({action, payload}),
    });

    await load();
  };

  const metrics = data.dashboard;

  return (
    <SectionContainer title="Reviews" description="Enterprise moderation and reputation controls.">
      <div className="grid gap-4 xl:grid-cols-4">
        <AdminCard title="Pending Reviews"><p className="text-2xl text-[#f4f4f4]">{metrics.pendingReviews}</p></AdminCard>
        <AdminCard title="Approved Reviews"><p className="text-2xl text-[#f4f4f4]">{metrics.approvedReviews}</p></AdminCard>
        <AdminCard title="Hidden Reviews"><p className="text-2xl text-[#f4f4f4]">{metrics.hiddenReviews}</p></AdminCard>
        <AdminCard title="Featured Reviews"><p className="text-2xl text-[#f4f4f4]">{metrics.featuredReviews}</p></AdminCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-4">
        <AdminCard title="Average Rating"><p className="text-2xl text-[#f4f4f4]">{metrics.averageRating.toFixed(1)}</p></AdminCard>
        <AdminCard title="Review Growth"><p className="text-2xl text-[#f4f4f4]">{metrics.reviewGrowth}%</p></AdminCard>
        <AdminCard title="Most Popular Service"><p className="text-xl text-[#f4f4f4]">{metrics.mostPopularService}</p></AdminCard>
        <AdminCard title="Customer Satisfaction"><p className="text-2xl text-[#f4f4f4]">{metrics.customerSatisfaction}%</p></AdminCard>
      </div>

      <AdminCard title="Review Operations" className="mt-4">
        <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <div className="grid gap-1.5">
            <FieldLabel htmlFor="review-status-filter">Status</FieldLabel>
            <select
              id="review-status-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <FieldLabel htmlFor="review-search">Search</FieldLabel>
            <input
              id="review-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, review text, or service"
              className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
            />
          </div>

          <button
            type="button"
            onClick={() => void load()}
            className="h-10 self-end rounded-lg border border-white/15 bg-[#1a1a1a] px-4 text-xs text-[#efefef]"
          >
            Refresh
          </button>
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-[#ef9a9a]">{errorMessage}</p> : null}

        <div className="mt-4 space-y-3">
          {isLoading ? <p className="text-sm text-[#bdbdbd]">Loading reviews...</p> : null}

          {!isLoading && data.reviews.length === 0 ? <p className="text-sm text-[#999999]">No reviews found.</p> : null}

          {data.reviews.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              draftReply={draftReply[review.id] ?? ""}
              onDraftReplyChange={(value) =>
                setDraftReply((current) => ({
                  ...current,
                  [review.id]: value,
                }))
              }
              draftEdit={draftEdit[review.id] ?? review.review}
              onDraftEditChange={(value) =>
                setDraftEdit((current) => ({
                  ...current,
                  [review.id]: value,
                }))
              }
              onAction={(action, payload) => void applyAction(review.id, action, payload)}
            />
          ))}
        </div>
      </AdminCard>
    </SectionContainer>
  );
}

function ReviewRow({
  review,
  draftReply,
  onDraftReplyChange,
  draftEdit,
  onDraftEditChange,
  onAction,
}: {
  review: ReviewDocument;
  draftReply: string;
  onDraftReplyChange: (value: string) => void;
  draftEdit: string;
  onDraftEditChange: (value: string) => void;
  onAction: (
    action: "approve" | "reject" | "hide" | "pin" | "verify" | "reply" | "edit" | "delete",
    payload?: Record<string, unknown>,
  ) => void;
}): React.JSX.Element {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#f1f1f1]">{review.customerName}</p>
          <p className="text-xs text-[#9a9a9a]">
            {review.country} • {review.language} • {review.service} • {review.rating}/5 • {review.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key)}
              className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAction("delete")}
            className="h-8 rounded-lg border border-red-300/20 bg-red-500/10 px-2 text-[11px] text-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-xs text-[#c6c6c6]">{review.review}</p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[11px] text-[#a8a8a8]">Edit review text</span>
          <textarea
            value={draftEdit}
            onChange={(event) => onDraftEditChange(event.target.value)}
            rows={3}
            className="rounded-lg border border-white/15 bg-[#151515] px-2.5 py-2 text-xs text-[#f0f0f0]"
          />
          <button
            type="button"
            onClick={() => onAction("edit", {review: draftEdit})}
            className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
          >
            Save Edit
          </button>
        </label>

        <label className="grid gap-1">
          <span className="text-[11px] text-[#a8a8a8]">Owner reply</span>
          <textarea
            value={draftReply}
            onChange={(event) => onDraftReplyChange(event.target.value)}
            rows={3}
            className="rounded-lg border border-white/15 bg-[#151515] px-2.5 py-2 text-xs text-[#f0f0f0]"
            placeholder="Thank you for visiting us."
          />
          <button
            type="button"
            onClick={() => onAction("reply", {message: draftReply})}
            className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
          >
            Publish Reply
          </button>
        </label>
      </div>

      {review.reply ? (
        <div className="mt-3 rounded-lg border border-sky-300/20 bg-sky-500/10 px-3 py-2">
          <p className="text-xs text-sky-100">{review.reply.authorName} • {review.reply.authorRole}</p>
          <p className="mt-1 text-xs text-sky-50">{review.reply.message}</p>
        </div>
      ) : null}
    </div>
  );
}
