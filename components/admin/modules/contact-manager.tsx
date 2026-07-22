"use client";

import * as React from "react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel, WorkflowButtons} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import type {ContactContentFields, WorkflowAction} from "@/types/admin-cms";

const EMPTY_CONTACT: ContactContentFields = {
  instagram: "",
  whatsapp: "",
  phone: "",
  email: "",
  googleMaps: "",
  businessHours: "",
};

export function ContactManager(): React.JSX.Element {
  const {items, createItem, updateItem, applyWorkflow} = useAdminContent<ContactContentFields>("contact");
  const document = items[0] ?? null;

  return (
    <ContactManagerEditor
      key={document?.id ?? "contact-new"}
      documentId={document?.id}
      initialDraft={document?.data ?? EMPTY_CONTACT}
      status={document?.status}
      createItem={createItem}
      updateItem={updateItem}
      applyWorkflow={applyWorkflow}
    />
  );
}

interface ContactManagerEditorProps {
  documentId?: string;
  initialDraft: ContactContentFields;
  status?: "draft" | "published";
  createItem: (data: ContactContentFields, id?: string) => Promise<{id: string}>;
  updateItem: (id: string, data: Partial<ContactContentFields>) => Promise<unknown>;
  applyWorkflow: (id: string, action: WorkflowAction) => Promise<{data: ContactContentFields}>;
}

function ContactManagerEditor({
  documentId,
  initialDraft,
  status,
  createItem,
  updateItem,
  applyWorkflow,
}: ContactManagerEditorProps): React.JSX.Element {
  const [draft, setDraft] = React.useState<ContactContentFields>(initialDraft);

  const ensureDocument = async (): Promise<string> => {
    if (documentId) {
      return documentId;
    }

    const created = await createItem(EMPTY_CONTACT, "primary");
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
      setDraft(EMPTY_CONTACT);
      return;
    }

    const restored = await applyWorkflow(documentId, "discard");
    setDraft(restored.data);
  };

  return (
    <SectionContainer title="Contact" description="Manage social links and business details.">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <AdminCard title="Contact Details" subtitle={status === "published" ? "Published" : "Draft"}>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ["instagram", "Instagram"],
              ["whatsapp", "WhatsApp"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["googleMaps", "Google Maps"],
              ["businessHours", "Business Hours"],
            ] as const).map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <FieldLabel htmlFor={`contact-${key}`}>{label}</FieldLabel>
                <input
                  id={`contact-${key}`}
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

        <AdminCard title="Live Preview" subtitle="Contact section output">
          <div className="space-y-2 rounded-xl border border-white/10 bg-[#141414] p-4 text-sm text-[#d2d2d2]">
            <p>Instagram: {draft.instagram || "-"}</p>
            <p>WhatsApp: {draft.whatsapp || "-"}</p>
            <p>Phone: {draft.phone || "-"}</p>
            <p>Email: {draft.email || "-"}</p>
            <p>Google Maps: {draft.googleMaps || "-"}</p>
            <p>Hours: {draft.businessHours || "-"}</p>
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
