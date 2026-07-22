"use client";

import * as React from "react";
import {GripVertical, Trash2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import type {ServiceContentFields} from "@/types/admin-cms";

const EMPTY_SERVICE: ServiceContentFields = {
  slug: "",
  title: "",
  description: "",
  enabled: true,
};

export function ServicesManager(): React.JSX.Element {
  const {items, createItem, updateItem, deleteItem, reorderItems, applyWorkflow} = useAdminContent<ServiceContentFields>("services");
  const [draft, setDraft] = React.useState<ServiceContentFields>(EMPTY_SERVICE);
  const [dragId, setDragId] = React.useState<string | null>(null);

  const addService = async (): Promise<void> => {
    await createItem(draft);
    setDraft(EMPTY_SERVICE);
  };

  const editService = async (id: string, current: ServiceContentFields): Promise<void> => {
    const title = window.prompt("Service title", current.title);
    if (!title) {
      return;
    }

    const description = window.prompt("Service description", current.description);
    if (!description) {
      return;
    }

    await updateItem(id, {
      title,
      description,
    });
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

  return (
    <SectionContainer title="Services" description="CRUD, ordering, and enable/disable service visibility.">
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <AdminCard title="Create Service">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <FieldLabel htmlFor="service-slug">Slug</FieldLabel>
              <input
                id="service-slug"
                value={draft.slug}
                onChange={(event) => setDraft((current) => ({...current, slug: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="service-title">Title</FieldLabel>
              <input
                id="service-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({...current, title: event.target.value}))}
                className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel htmlFor="service-description">Description</FieldLabel>
              <textarea
                id="service-description"
                value={draft.description}
                onChange={(event) => setDraft((current) => ({...current, description: event.target.value}))}
                rows={4}
                className="rounded-lg border border-white/15 bg-[#151515] px-3 py-2 text-sm text-[#f0f0f0]"
              />
            </div>
            <button
              type="button"
              onClick={() => void addService()}
              className="h-10 rounded-lg border border-white/15 bg-[#1a1a1a] px-3 text-xs text-[#efefef]"
            >
              Save Service
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Services List" subtitle="Drag & drop to reorder">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void onDrop(item.id)}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#141414] p-3"
              >
                <GripVertical className="mt-1 h-4 w-4 text-[#8b8b8b]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#f1f1f1]">{item.data.title}</p>
                  <p className="text-xs text-[#979797]">/{item.data.slug}</p>
                  <p className="mt-1 text-xs text-[#b0b0b0]">{item.data.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void editService(item.id, item.data)}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    Edit
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
                  <button
                    type="button"
                    onClick={() => void applyWorkflow(item.id, item.data.enabled ? "disable" : "enable")}
                    className="h-8 rounded-lg border border-white/10 bg-[#1b1b1b] px-2 text-[11px] text-[#ececec]"
                  >
                    {item.data.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteItem(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#191919] text-[#d1d1d1]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 ? <p className="text-sm text-[#999999]">No services yet.</p> : null}
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
