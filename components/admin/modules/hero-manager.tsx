"use client";

import * as React from "react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel, MediaPicker, WorkflowButtons} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import {useMediaLibrary} from "@/hooks/use-media-library";
import type {HeroContentFields, MediaAsset, WorkflowAction} from "@/types/admin-cms";

const EMPTY_HERO: HeroContentFields = {
  headline: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  heroVideoUrl: "",
  heroVideoPath: "",
  heroPosterUrl: "",
  heroPosterPath: "",
};

export function HeroManager(): React.JSX.Element {
  const {items, createItem, updateItem, applyWorkflow, isLoading} = useAdminContent<HeroContentFields>("hero");
  const {assets, uploadAsset} = useMediaLibrary();
  const document = items[0] ?? null;

  return (
    <HeroManagerEditor
      key={document?.id ?? "hero-new"}
      documentId={document?.id}
      initialDraft={document?.data ?? EMPTY_HERO}
      status={document?.status}
      isLoading={isLoading}
      assets={assets}
      createItem={createItem}
      updateItem={updateItem}
      applyWorkflow={applyWorkflow}
      uploadAsset={uploadAsset}
    />
  );
}

interface HeroManagerEditorProps {
  documentId?: string;
  initialDraft: HeroContentFields;
  status?: "draft" | "published";
  isLoading: boolean;
  assets: MediaAsset[];
  createItem: (data: HeroContentFields, id?: string) => Promise<{id: string}>;
  updateItem: (id: string, data: Partial<HeroContentFields>) => Promise<unknown>;
  applyWorkflow: (id: string, action: WorkflowAction) => Promise<{data: HeroContentFields}>;
  uploadAsset: (folder: "Hero" | "Gallery" | "Reviews" | "Logo" | "General", file: File) => Promise<{storagePath: string; downloadUrl: string}>;
}

function HeroManagerEditor({
  documentId,
  initialDraft,
  status,
  isLoading,
  assets,
  createItem,
  updateItem,
  applyWorkflow,
  uploadAsset,
}: HeroManagerEditorProps): React.JSX.Element {
  const [draft, setDraft] = React.useState<HeroContentFields>(initialDraft);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const autosaveTimeoutRef = React.useRef<number | null>(null);
  const firstRenderRef = React.useRef(true);

  const ensureDocument = React.useCallback(async (): Promise<string> => {
    if (documentId) {
      return documentId;
    }

    const created = await createItem(EMPTY_HERO, "primary");
    return created.id;
  }, [documentId, createItem]);

  const saveDraft = React.useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const id = await ensureDocument();
      await updateItem(id, draft);
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, ensureDocument, updateItem]);

  const publish = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const id = await ensureDocument();
      await updateItem(id, draft);
      await applyWorkflow(id, "publish");
    } finally {
      setIsSubmitting(false);
    }
  };

  const discard = async (): Promise<void> => {
    if (!documentId) {
      setDraft(EMPTY_HERO);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await applyWorkflow(documentId, "discard");
      setDraft(updated.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (type: "video" | "poster", file: File): Promise<void> => {
    const uploaded = await uploadAsset("Hero", file);

    if (type === "video") {
      setDraft((current) => ({
        ...current,
        heroVideoPath: uploaded.storagePath,
        heroVideoUrl: uploaded.downloadUrl,
      }));
      return;
    }

    setDraft((current) => ({
      ...current,
      heroPosterPath: uploaded.storagePath,
      heroPosterUrl: uploaded.downloadUrl,
    }));
  };

  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = window.setTimeout(() => {
      void saveDraft();
    }, 1000);

    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [draft, saveDraft]);

  return (
    <SectionContainer
      title="Hero Management"
      description="Manage hero copy, media, and publication status with live preview."
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="Hero Fields" subtitle={status === "published" ? "Published" : "Draft"}>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <FieldLabel htmlFor="hero-headline">Headline</FieldLabel>
              <input
                id="hero-headline"
                value={draft.headline}
                onChange={(event) => setDraft((current) => ({...current, headline: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="hero-subtitle">Subtitle</FieldLabel>
              <textarea
                id="hero-subtitle"
                value={draft.subtitle}
                onChange={(event) => setDraft((current) => ({...current, subtitle: event.target.value}))}
                rows={3}
                className="rounded-lg border border-white/15 bg-[#151515] px-3 py-2 text-sm text-[#f0f0f0]"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="hero-cta-text">CTA Text</FieldLabel>
                <input
                  id="hero-cta-text"
                  value={draft.ctaText}
                  onChange={(event) => setDraft((current) => ({...current, ctaText: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
              <div className="grid gap-2">
                <FieldLabel htmlFor="hero-cta-link">CTA Link</FieldLabel>
                <input
                  id="hero-cta-link"
                  value={draft.ctaLink}
                  onChange={(event) => setDraft((current) => ({...current, ctaLink: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
            </div>

            <MediaPicker
              label="Hero Video"
              folder="Hero"
              assets={assets}
              selectedPath={draft.heroVideoPath}
              selectedUrl={draft.heroVideoUrl}
              onChange={(asset) =>
                setDraft((current) => ({
                  ...current,
                  heroVideoPath: asset?.storagePath ?? "",
                  heroVideoUrl: asset?.downloadUrl ?? "",
                }))
              }
            />

            <MediaPicker
              label="Hero Poster"
              folder="Hero"
              assets={assets}
              selectedPath={draft.heroPosterPath}
              selectedUrl={draft.heroPosterUrl}
              onChange={(asset) =>
                setDraft((current) => ({
                  ...current,
                  heroPosterPath: asset?.storagePath ?? "",
                  heroPosterUrl: asset?.downloadUrl ?? "",
                }))
              }
            />

            <div className="grid gap-2 md:grid-cols-2">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]">
                Upload Hero Video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadFile("video", file);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    heroVideoPath: "",
                    heroVideoUrl: "",
                  }))
                }
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]"
              >
                Delete Hero Video
              </button>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]">
                Upload Poster Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadFile("poster", file);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    heroPosterPath: "",
                    heroPosterUrl: "",
                  }))
                }
                className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-[#161616] px-3 text-xs text-[#ececec]"
              >
                Delete Poster Image
              </button>
            </div>

            <WorkflowButtons
              onSave={saveDraft}
              onPublish={publish}
              onDiscard={discard}
              isDisabled={isLoading || isSubmitting}
            />
          </div>
        </AdminCard>

        <AdminCard title="Live Preview" subtitle="Updates instantly without page refresh">
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-[#151515] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8a8a8a]">Hero Preview</p>
              <h3 className="mt-2 text-lg font-semibold text-[#f4f4f4]">{draft.headline || "Headline preview"}</h3>
              <p className="mt-2 text-sm text-[#a4a4a4]">{draft.subtitle || "Subtitle preview"}</p>
              <button type="button" className="mt-3 h-9 rounded-lg border border-white/20 bg-[#1b1b1b] px-3 text-xs text-[#f0f0f0]">
                {draft.ctaText || "CTA"}
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#151515] p-4 text-xs text-[#9a9a9a]">
              <p>Video: {draft.heroVideoPath || "No video selected"}</p>
              <p>Poster: {draft.heroPosterPath || "No poster selected"}</p>
            </div>
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
