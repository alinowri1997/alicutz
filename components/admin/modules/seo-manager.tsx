"use client";

import * as React from "react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel, WorkflowButtons} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import type {SeoContentFields, WorkflowAction} from "@/types/admin-cms";

const EMPTY_SEO: SeoContentFields = {
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  canonicalUrl: "",
  openGraphTitle: "",
  openGraphDescription: "",
  openGraphImageUrl: "",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  robots: "index,follow",
  sitemapEnabled: true,
  sitemapBaseUrl: "",
  faviconUrl: "",
};

export function SeoManager(): React.JSX.Element {
  const {items, createItem, updateItem, applyWorkflow} = useAdminContent<SeoContentFields>("seo");
  const document = items[0] ?? null;

  return (
    <SeoManagerEditor
      key={document?.id ?? "seo-new"}
      documentId={document?.id}
      status={document?.status}
      initialDraft={document?.data ?? EMPTY_SEO}
      createItem={createItem}
      updateItem={updateItem}
      applyWorkflow={applyWorkflow}
    />
  );
}

interface SeoManagerEditorProps {
  documentId?: string;
  status?: "draft" | "published";
  initialDraft: SeoContentFields;
  createItem: (data: SeoContentFields, id?: string) => Promise<{id: string}>;
  updateItem: (id: string, data: Partial<SeoContentFields>) => Promise<unknown>;
  applyWorkflow: (id: string, action: WorkflowAction) => Promise<{data: SeoContentFields}>;
}

function SeoManagerEditor({
  documentId,
  status,
  initialDraft,
  createItem,
  updateItem,
  applyWorkflow,
}: SeoManagerEditorProps): React.JSX.Element {
  const [draft, setDraft] = React.useState<SeoContentFields>(initialDraft);
  const autosaveTimeoutRef = React.useRef<number | null>(null);
  const firstRenderRef = React.useRef(true);

  const ensureDocument = React.useCallback(async (): Promise<string> => {
    if (documentId) {
      return documentId;
    }

    const created = await createItem(EMPTY_SEO, "primary");
    return created.id;
  }, [documentId, createItem]);

  const saveDraft = React.useCallback(async (): Promise<void> => {
    const id = await ensureDocument();
    await updateItem(id, draft);
  }, [draft, ensureDocument, updateItem]);

  const publish = async (): Promise<void> => {
    const id = await ensureDocument();
    await updateItem(id, draft);
    await applyWorkflow(id, "publish");
  };

  const discard = async (): Promise<void> => {
    if (!documentId) {
      setDraft(EMPTY_SEO);
      return;
    }

    const restored = await applyWorkflow(documentId, "discard");
    setDraft(restored.data);
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
    <SectionContainer title="SEO" description="Manage metadata, social cards, robots, and sitemap configuration.">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <AdminCard title="SEO Fields" subtitle={status === "published" ? "Published" : "Draft"}>
          <div className="grid gap-3">
            {([
              ["metaTitle", "Meta Title"],
              ["metaDescription", "Meta Description"],
              ["canonicalUrl", "Canonical URL"],
              ["openGraphTitle", "Open Graph Title"],
              ["openGraphDescription", "Open Graph Description"],
              ["openGraphImageUrl", "Open Graph Image URL"],
              ["twitterTitle", "Twitter Title"],
              ["twitterDescription", "Twitter Description"],
              ["robots", "Robots"],
              ["sitemapBaseUrl", "Sitemap Base URL"],
              ["faviconUrl", "Favicon URL"],
            ] as const).map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <FieldLabel htmlFor={`seo-${key}`}>{label}</FieldLabel>
                <input
                  id={`seo-${key}`}
                  value={draft[key]}
                  onChange={(event) => setDraft((current) => ({...current, [key]: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
            ))}
            <div className="grid gap-2">
              <FieldLabel htmlFor="seo-keywords">Keywords (comma separated)</FieldLabel>
              <input
                id="seo-keywords"
                value={draft.keywords.join(", ")}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    keywords: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                  }))
                }
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="seo-twitter-card">Twitter Card</FieldLabel>
                <select
                  id="seo-twitter-card"
                  value={draft.twitterCard}
                  onChange={(event) =>
                    setDraft((current) => ({...current, twitterCard: event.target.value as SeoContentFields["twitterCard"]}))
                  }
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                </select>
              </div>
              <label className="mt-6 inline-flex items-center gap-2 text-sm text-[#d5d5d5]">
                <input
                  type="checkbox"
                  checked={draft.sitemapEnabled}
                  onChange={(event) => setDraft((current) => ({...current, sitemapEnabled: event.target.checked}))}
                />
                Sitemap Enabled
              </label>
            </div>
            <WorkflowButtons onSave={saveDraft} onPublish={publish} onDiscard={discard} />
          </div>
        </AdminCard>

        <AdminCard title="Live Preview" subtitle="Metadata preview">
          <div className="space-y-2 rounded-xl border border-white/10 bg-[#141414] p-4 text-sm text-[#d2d2d2]">
            <p>Title: {draft.metaTitle || "-"}</p>
            <p>Description: {draft.metaDescription || "-"}</p>
            <p>Canonical: {draft.canonicalUrl || "-"}</p>
            <p>Keywords: {draft.keywords.join(", ") || "-"}</p>
            <p>Robots: {draft.robots || "-"}</p>
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
