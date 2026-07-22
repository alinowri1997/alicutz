"use client";

import * as React from "react";
import {Trash2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import {useMediaLibrary} from "@/hooks/use-media-library";
import type {ReviewContentFields} from "@/types/admin-cms";

const EMPTY_REVIEW: ReviewContentFields = {
  customerName: "",
  country: "",
  rating: 5,
  content: "",
  photoUrl: "",
  photoPath: "",
  approved: false,
};

export function ReviewsManager(): React.JSX.Element {
  const {items, createItem, updateItem, deleteItem, applyWorkflow} = useAdminContent<ReviewContentFields>("reviews");
  const {assets, uploadAsset} = useMediaLibrary();
  const [draft, setDraft] = React.useState<ReviewContentFields>(EMPTY_REVIEW);

  const addReview = async (): Promise<void> => {
    await createItem(draft);
    setDraft(EMPTY_REVIEW);
  };

  const editReview = async (id: string, current: ReviewContentFields): Promise<void> => {
    const content = window.prompt("Review content", current.content);
    if (!content) {
      return;
    }

    await updateItem(id, {content});
  };

  const onUpload = async (file: File): Promise<void> => {
    const uploaded = await uploadAsset("Reviews", file);
    setDraft((current) => ({
      ...current,
      photoPath: uploaded.storagePath,
      photoUrl: uploaded.downloadUrl,
    }));
  };

  return (
    <SectionContainer title="Reviews" description="CRUD with approve/hide controls.">
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <AdminCard title="Create Review">
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="review-name">Customer name</FieldLabel>
                <input
                  id="review-name"
                  value={draft.customerName}
                  onChange={(event) => setDraft((current) => ({...current, customerName: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
              <div className="grid gap-2">
                <FieldLabel htmlFor="review-country">Country</FieldLabel>
                <input
                  id="review-country"
                  value={draft.country}
                  onChange={(event) => setDraft((current) => ({...current, country: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="review-rating">Rating</FieldLabel>
              <select
                id="review-rating"
                value={draft.rating}
                onChange={(event) => setDraft((current) => ({...current, rating: Number(event.target.value) as ReviewContentFields["rating"]}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="review-content">Review content</FieldLabel>
              <textarea
                id="review-content"
                value={draft.content}
                onChange={(event) => setDraft((current) => ({...current, content: event.target.value}))}
                rows={4}
                className="rounded-lg border border-white/15 bg-[#151515] px-3 py-2 text-sm text-[#f0f0f0]"
              />
            </div>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]">
              Upload Customer Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void onUpload(file);
                  }
                }}
              />
            </label>
            <select
              value={draft.photoPath || ""}
              onChange={(event) => {
                const selected = assets.find((asset) => asset.storagePath === event.target.value);
                if (!selected) {
                  return;
                }

                setDraft((current) => ({
                  ...current,
                  photoPath: selected.storagePath,
                  photoUrl: selected.downloadUrl,
                }));
              }}
              className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
            >
              <option value="">Reuse photo from media library</option>
              {assets
                .filter((asset) => asset.folder === "Reviews")
                .map((asset) => (
                  <option key={asset.id} value={asset.storagePath}>
                    {asset.fileName}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => void addReview()}
              className="h-10 rounded-lg border border-white/15 bg-[#1a1a1a] px-3 text-xs text-[#efefef]"
            >
              Save Review
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Review Queue">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-[#141414] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#f1f1f1]">{item.data.customerName}</p>
                    <p className="text-xs text-[#9a9a9a]">{item.data.country} • {item.data.rating}/5</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteItem(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#191919] text-[#d1d1d1]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#b0b0b0]">{item.data.content}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void editReview(item.id, item.data)}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyWorkflow(item.id, "approve")}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyWorkflow(item.id, "hide")}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyWorkflow(item.id, "publish")}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyWorkflow(item.id, "discard")}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 ? <p className="text-sm text-[#999999]">No reviews yet.</p> : null}
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
