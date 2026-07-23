"use client";

import * as React from "react";
import Image from "next/image";
import {GripVertical, Trash2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel, WorkflowButtons} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import {useMediaLibrary} from "@/hooks/use-media-library";
import type {FeaturedCutFields} from "@/types/admin-cms";

const EMPTY_CUT: FeaturedCutFields = {
  imageUrl: "",
  imagePath: "",
  instagramPostUrl: "",
  title: "",
  alt: "",
  enabled: true,
};

export function FeaturedCutsManager(): React.JSX.Element {
  const {items, createItem, updateItem, deleteItem, reorderItems, applyWorkflow} = useAdminContent<FeaturedCutFields>("featuredCuts");
  const {assets, uploadAsset} = useMediaLibrary();

  const [draft, setDraft] = React.useState<FeaturedCutFields>(EMPTY_CUT);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetDraft = () => setDraft(EMPTY_CUT);

  const addCut = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await createItem(draft);
      resetDraft();
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpload = async (file: File): Promise<void> => {
    const uploaded = await uploadAsset("Gallery", file);
    setDraft((current) => ({
      ...current,
      imagePath: uploaded.storagePath,
      imageUrl: uploaded.downloadUrl,
      alt: current.alt || uploaded.fileName,
    }));
  };

  const onDrop = async (targetId: string): Promise<void> => {
    if (!dragId || dragId === targetId) {
      return;
    }

    const ids = items.map((item) => item.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);

    if (from < 0 || to < 0) {
      return;
    }

    ids.splice(to, 0, ids.splice(from, 1)[0]);
    await reorderItems(ids);
    setDragId(null);
  };

  const replaceImage = async (id: string, file: File): Promise<void> => {
    const uploaded = await uploadAsset("Gallery", file);
    await updateItem(id, {
      imagePath: uploaded.storagePath,
      imageUrl: uploaded.downloadUrl,
    });
  };

  return (
    <SectionContainer title="Featured Cuts" description="Manage carousel items, order, media, and publishing.">
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <AdminCard title="Create Featured Cut">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <FieldLabel htmlFor="cut-instagram">Instagram Post URL</FieldLabel>
              <input
                id="cut-instagram"
                value={draft.instagramPostUrl}
                onChange={(event) => setDraft((current) => ({...current, instagramPostUrl: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="cut-title">Image title (optional)</FieldLabel>
              <input
                id="cut-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({...current, title: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="cut-alt">Image alt text</FieldLabel>
              <input
                id="cut-alt"
                value={draft.alt}
                onChange={(event) => setDraft((current) => ({...current, alt: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-[#d5d5d5]">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(event) => setDraft((current) => ({...current, enabled: event.target.checked}))}
              />
              Enabled
            </label>

            <div className="grid gap-2">
              <FieldLabel htmlFor="cut-library-image">Reuse Existing Media</FieldLabel>
              <select
                id="cut-library-image"
                value={draft.imagePath}
                onChange={(event) => {
                  const selected = assets.find((asset) => asset.storagePath === event.target.value);
                  if (!selected) {
                    return;
                  }

                  setDraft((current) => ({
                    ...current,
                    imagePath: selected.storagePath,
                    imageUrl: selected.downloadUrl,
                    alt: current.alt || selected.fileName,
                  }));
                }}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              >
                <option value="">Select gallery asset</option>
                {assets
                  .filter((asset) => asset.folder === "Gallery")
                  .map((asset) => (
                    <option key={asset.id} value={asset.storagePath}>
                      {asset.fileName}
                    </option>
                  ))}
              </select>
            </div>

            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]">
              Upload Image
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

            <WorkflowButtons
              onSave={addCut}
              onPublish={addCut}
              onDiscard={resetDraft}
              isDisabled={isSubmitting}
            />
          </div>
        </AdminCard>

        <AdminCard title="Preview Carousel" subtitle="Drag and drop to reorder">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void onDrop(item.id)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414] p-3"
              >
                <GripVertical className="h-4 w-4 text-[#8b8b8b]" aria-hidden="true" />
                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-[#0f0f0f]">
                  {item.data.imageUrl ? (
                    <Image src={item.data.imageUrl} alt={item.data.alt || "Featured cut"} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[#f1f1f1]">{item.data.title || item.data.alt || "Untitled"}</p>
                  <p className="truncate text-xs text-[#979797]">{item.data.instagramPostUrl || "No URL"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void applyWorkflow(item.id, item.data.enabled ? "disable" : "enable")}
                  className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                >
                  {item.data.enabled ? "Disable" : "Enable"}
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
                <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void replaceImage(item.id, file);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void deleteItem(item.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#191919] text-[#d1d1d1]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
