"use client";

import * as React from "react";
import {GripVertical, Trash2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {FieldLabel} from "@/components/admin/modules/shared";
import {useAdminContent} from "@/hooks/use-admin-content";
import type {LanguageContentFields} from "@/types/admin-cms";

const EMPTY_LANGUAGE: LanguageContentFields = {
  code: "",
  label: "",
  direction: "ltr",
  enabled: true,
  order: 0,
};

export function LanguagesManager(): React.JSX.Element {
  const {items, createItem, updateItem, deleteItem, reorderItems} = useAdminContent<LanguageContentFields>("languages");
  const [draft, setDraft] = React.useState<LanguageContentFields>(EMPTY_LANGUAGE);
  const [dragId, setDragId] = React.useState<string | null>(null);

  const addLanguage = async (): Promise<void> => {
    await createItem({...draft, order: items.length});
    setDraft(EMPTY_LANGUAGE);
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
    <SectionContainer title="Languages" description="Manage active languages and add future languages.">
      <div className="grid gap-4 xl:grid-cols-[1fr_1.05fr]">
        <AdminCard title="Add Language">
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="lang-code">Code</FieldLabel>
                <input
                  id="lang-code"
                  value={draft.code}
                  onChange={(event) => setDraft((current) => ({...current, code: event.target.value.toLowerCase()}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                  placeholder="en"
                />
              </div>
              <div className="grid gap-2">
                <FieldLabel htmlFor="lang-label">Label</FieldLabel>
                <input
                  id="lang-label"
                  value={draft.label}
                  onChange={(event) => setDraft((current) => ({...current, label: event.target.value}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="lang-direction">Direction</FieldLabel>
                <select
                  id="lang-direction"
                  value={draft.direction}
                  onChange={(event) => setDraft((current) => ({...current, direction: event.target.value as "ltr" | "rtl"}))}
                  className="h-10 rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
                >
                  <option value="ltr">LTR</option>
                  <option value="rtl">RTL</option>
                </select>
              </div>
              <label className="mt-6 inline-flex items-center gap-2 text-sm text-[#d5d5d5]">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(event) => setDraft((current) => ({...current, enabled: event.target.checked}))}
                />
                Enabled
              </label>
            </div>
            <button
              type="button"
              onClick={() => void addLanguage()}
              className="h-10 rounded-lg border border-white/15 bg-[#1a1a1a] px-3 text-xs text-[#efefef]"
            >
              Save Language
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Language List" subtitle="Drag and drop to reorder">
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#f1f1f1]">{item.data.label}</p>
                  <p className="text-xs text-[#979797]">
                    {item.data.code} • {item.data.direction.toUpperCase()} • {item.data.enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void updateItem(item.id, {
                      enabled: !item.data.enabled,
                    })
                  }
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
            ))}
          </div>
        </AdminCard>
      </div>
    </SectionContainer>
  );
}
