"use client";

import * as React from "react";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ConfirmDialog, EmptyState, PageHeader} from "@/components/admin";
import {createAdminId, DEFAULT_ADMIN_GALLERY, type AdminGalleryAsset} from "@/lib/admin-dashboard";

export function GalleryClient(): React.JSX.Element {
  const [gallery, setGallery] = React.useState<AdminGalleryAsset[]>(DEFAULT_ADMIN_GALLERY);
  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const addAsset = (): void => {
    if (!title.trim() || !imageUrl.trim()) {
      return;
    }

    setGallery((current) => [
      {
        id: createAdminId("gallery"),
        title: title.trim(),
        alt: `${title.trim()} image`,
        imageUrl: imageUrl.trim(),
        featured: false,
        uploadedAt: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    setTitle("");
    setImageUrl("");
  };

  const toggleFeatured = (id: string): void => {
    setGallery((current) => current.map((asset) => (asset.id === id ? {...asset, featured: !asset.featured} : asset)));
  };

  const removeAsset = (id: string): void => {
    setGallery((current) => current.filter((asset) => asset.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        section="Gallery"
        title="Gallery assets"
        description="Manage hero-ready imagery locally and flag the assets that should surface first in the premium selection."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="type-caption text-muted">Add asset</p>
          <div className="mt-4 space-y-4">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Skin Fade" />
            <Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="/gallery/skin-fade.jpg" />
            <Button variant="accent" size="md" onClick={addAsset}>
              Add image
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {gallery.map((asset) => (
            <div key={asset.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[4/3] bg-background">
                <Image src={asset.imageUrl} alt={asset.alt} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="type-h6 text-text">{asset.title}</h3>
                    <p className="type-small text-muted">Uploaded {asset.uploadedAt}</p>
                  </div>
                  <Badge variant={asset.featured ? "default" : "outline"}>{asset.featured ? "Featured" : "Hidden"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => toggleFeatured(asset.id)}>
                    {asset.featured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setConfirmId(asset.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {gallery.length === 0 ? (
        <EmptyState
          title="No gallery assets"
          message="Add uploaded assets here. The layout is ready for Supabase Storage later."
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Remove image"
        description="This deletes the asset from local state only. The route can later persist the same action to a backend."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (confirmId) {
            removeAsset(confirmId);
          }
          setConfirmId(null);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmId(null);
          }
        }}
      />
    </div>
  );
}
