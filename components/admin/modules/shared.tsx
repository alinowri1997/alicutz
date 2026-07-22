"use client";

import * as React from "react";

import {AdminCard} from "@/components/admin";
import type {AdminMediaFolder, MediaAsset} from "@/types/admin-cms";

export interface WorkflowButtonsProps {
  onSave: () => Promise<void> | void;
  onPublish: () => Promise<void> | void;
  onDiscard: () => Promise<void> | void;
  isDisabled?: boolean;
}

export function WorkflowButtons({onSave, onPublish, onDiscard, isDisabled}: WorkflowButtonsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void onSave()}
        disabled={isDisabled}
        className="h-9 rounded-lg border border-white/15 bg-[#1a1a1a] px-3 text-xs text-[#f2f2f2] disabled:opacity-50"
      >
        Save Draft
      </button>
      <button
        type="button"
        onClick={() => void onPublish()}
        disabled={isDisabled}
        className="h-9 rounded-lg border border-white/15 bg-[#1d1d1d] px-3 text-xs text-[#f2f2f2] disabled:opacity-50"
      >
        Publish
      </button>
      <button
        type="button"
        onClick={() => void onDiscard()}
        disabled={isDisabled}
        className="h-9 rounded-lg border border-white/15 bg-[#121212] px-3 text-xs text-[#d0d0d0] disabled:opacity-50"
      >
        Discard Changes
      </button>
    </div>
  );
}

export interface MediaPickerProps {
  label: string;
  folder: AdminMediaFolder;
  assets: MediaAsset[];
  selectedPath: string;
  selectedUrl: string;
  onChange: (asset: MediaAsset | null) => void;
}

export function MediaPicker({
  label,
  folder,
  assets,
  selectedPath,
  selectedUrl,
  onChange,
}: MediaPickerProps): React.JSX.Element {
  const filtered = assets.filter((item) => item.folder === folder);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.12em] text-[#8e8e8e]">{label}</label>
      <select
        value={selectedPath}
        onChange={(event) => {
          const next = filtered.find((asset) => asset.storagePath === event.target.value) ?? null;
          onChange(next);
        }}
        className="h-10 w-full rounded-lg border border-white/15 bg-[#151515] px-3 text-sm text-[#f0f0f0]"
      >
        <option value="">Select from media library</option>
        {filtered.map((asset) => (
          <option key={asset.id} value={asset.storagePath}>
            {asset.fileName}
          </option>
        ))}
      </select>
      {selectedUrl ? (
        <AdminCard className="p-3">
          <p className="text-xs text-[#a0a0a0]">Selected: {selectedPath}</p>
        </AdminCard>
      ) : null}
    </div>
  );
}

export function FieldLabel({children, htmlFor}: {children: React.ReactNode; htmlFor?: string}): React.JSX.Element {
  return (
    <label htmlFor={htmlFor} className="text-xs uppercase tracking-[0.12em] text-[#8e8e8e]">
      {children}
    </label>
  );
}
