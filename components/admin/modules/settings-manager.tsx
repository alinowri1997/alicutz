"use client";

import * as React from "react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel, WorkflowButtons} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import type {SiteSettingsContentFields, WorkflowAction} from "@/types/admin-cms";

const EMPTY_SETTINGS: SiteSettingsContentFields = {
  siteName: "Alicutz",
  defaultLocale: "tr",
  primaryCtaLabel: "Book via WhatsApp",
  primaryCtaHref: "https://wa.me/905441772249",
  metaTitleTemplate: "%s | Alicutz",
  metaDescription: "Premium private barber service in Istanbul.",
};

export function SettingsManager(): React.JSX.Element {
  const {items, createItem, updateItem, applyWorkflow} = useAdminContent<SiteSettingsContentFields>("siteSettings");
  const document = items[0] ?? null;

  return (
    <SettingsManagerEditor
      key={document?.id ?? "settings-new"}
      documentId={document?.id}
      initialDraft={document?.data ?? EMPTY_SETTINGS}
      status={document?.status}
      createItem={createItem}
      updateItem={updateItem}
      applyWorkflow={applyWorkflow}
    />
  );
}

interface SettingsManagerEditorProps {
  documentId?: string;
  initialDraft: SiteSettingsContentFields;
  status?: "draft" | "published";
  createItem: (data: SiteSettingsContentFields, id?: string) => Promise<{id: string}>;
  updateItem: (id: string, data: Partial<SiteSettingsContentFields>) => Promise<unknown>;
  applyWorkflow: (id: string, action: WorkflowAction) => Promise<{data: SiteSettingsContentFields}>;
}

function SettingsManagerEditor({
  documentId,
  initialDraft,
  status,
  createItem,
  updateItem,
  applyWorkflow,
}: SettingsManagerEditorProps): React.JSX.Element {
  const [draft, setDraft] = React.useState<SiteSettingsContentFields>(initialDraft);

  const ensureDocument = async (): Promise<string> => {
    if (documentId) {
      return documentId;
    }

    const created = await createItem(EMPTY_SETTINGS, "primary");
    return created.id;
  };

  const saveDraft = async (): Promise<void> => {
    const id = await ensureDocument();
    await updateItem(id, draft);
  };

  const publish = async (): Promise<void> => {
    const id = await ensureDocument();
    await updateItem(id, draft);
    await applyWorkflow(id, "publish");
  };

  const discard = async (): Promise<void> => {
    if (!documentId) {
      setDraft(EMPTY_SETTINGS);
      return;
    }

    const restored = await applyWorkflow(documentId, "discard");
    setDraft(restored.data);
  };

  return (
    <SectionContainer title="Site Settings" description="Global admin-controlled site settings and metadata defaults.">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <AdminCard title="Settings" subtitle={status === "published" ? "Published" : "Draft"}>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["siteName", "Site Name"],
              ["defaultLocale", "Default Locale"],
              ["primaryCtaLabel", "Primary CTA Label"],
              ["primaryCtaHref", "Primary CTA Link"],
              ["metaTitleTemplate", "Meta Title Template"],
              ["metaDescription", "Meta Description"],
            ] as const).map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <FieldLabel htmlFor={`settings-${key}`}>{label}</FieldLabel>
                <input
                  id={`settings-${key}`}
                  value={draft[key]}
                  onChange={(event) => setDraft((current) => ({...current, [key]: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <WorkflowButtons onSave={saveDraft} onPublish={publish} onDiscard={discard} />
          </div>
        </AdminCard>

        <AdminCard title="Live Preview" subtitle="Current draft output">
          <div className="space-y-2 rounded-xl border border-white/10 bg-[#141414] p-4 text-sm text-[#d2d2d2]">
            <p>Site Name: {draft.siteName || "-"}</p>
            <p>Default Locale: {draft.defaultLocale || "-"}</p>
            <p>Primary CTA: {draft.primaryCtaLabel || "-"}</p>
            <p>Primary Link: {draft.primaryCtaHref || "-"}</p>
            <p>Meta Template: {draft.metaTitleTemplate || "-"}</p>
            <p>Meta Description: {draft.metaDescription || "-"}</p>
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
