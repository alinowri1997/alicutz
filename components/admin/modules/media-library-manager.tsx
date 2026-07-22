"use client";

import * as React from "react";
import {Pencil, Trash2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {useMediaLibrary} from "@/hooks/use-media-library";
import type {AdminMediaFolder} from "@/types/admin-cms";

const FOLDERS: AdminMediaFolder[] = ["Hero", "Gallery", "Reviews", "Logo", "General"];

export function MediaLibraryManager(): React.JSX.Element {
  const {assets, uploadAsset, renameAsset, deleteAsset} = useMediaLibrary();
  const [folder, setFolder] = React.useState<AdminMediaFolder>("General");

  const visible = assets.filter((asset) => asset.folder === folder);

  return (
    <SectionContainer title="Media Library" description="Reusable assets for Hero, Gallery, Reviews, Logo, and General folders.">
      <AdminCard title="Media Assets" subtitle="Upload, rename, delete, and reuse from one place.">
        <div className="mb-4 flex flex-wrap gap-2">
          {FOLDERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFolder(item)}
              className={`h-8 rounded-lg border px-3 text-xs ${
                folder === item
                  ? "border-white/25 bg-[#1b1b1b] text-[#f2f2f2]"
                  : "border-white/10 bg-[#141414] text-[#b6b6b6]"
              }`}
            >
              {item}
            </button>
          ))}

          <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-white/15 bg-[#171717] px-3 text-xs text-[#ececec]">
            Upload
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadAsset(folder, file);
                }
              }}
            />
          </label>
        </div>

        <div className="space-y-2">
          {visible.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#131313] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#f1f1f1]">{asset.fileName}</p>
                <p className="truncate text-xs text-[#969696]">{asset.storagePath}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = window.prompt("Rename file", asset.fileName);
                    if (next) {
                      void renameAsset(asset.id, next);
                    }
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#191919] text-[#d1d1d1]"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteAsset(asset.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#191919] text-[#d1d1d1]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

          {visible.length === 0 ? <p className="text-sm text-[#979797]">No media in this folder.</p> : null}
        </div>
      </AdminCard>
    </SectionContainer>
  );
}
