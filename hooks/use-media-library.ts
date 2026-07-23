"use client";

import * as React from "react";

import type {AdminMediaFolder, MediaAsset} from "@/types/admin-cms";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface UseMediaLibraryResult {
  assets: MediaAsset[];
  isLoading: boolean;
  refresh: (folder?: AdminMediaFolder) => Promise<void>;
  uploadAsset: (folder: AdminMediaFolder, file: File) => Promise<MediaAsset>;
  renameAsset: (id: string, fileName: string) => Promise<MediaAsset>;
  replaceAsset: (id: string, file: File) => Promise<MediaAsset>;
  deleteAsset: (id: string) => Promise<void>;
}

export function useMediaLibrary(): UseMediaLibraryResult {
  const [assets, setAssets] = React.useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async (folder?: AdminMediaFolder) => {
    const url = folder ? `/api/admin/media?folder=${encodeURIComponent(folder)}` : "/api/admin/media";
    const response = await fetch(url, {credentials: "include"});

    if (!response.ok) {
      throw new Error("Failed to load media library.");
    }

    const body = (await response.json()) as ApiResponse<MediaAsset[]>;
    setAssets(body.data ?? []);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/media", {credentials: "include"});

        if (!response.ok) {
          if (isMounted) {
            setAssets([]);
          }
          return;
        }

        const body = (await response.json()) as ApiResponse<MediaAsset[]>;

        if (isMounted) {
          setAssets(body.data ?? []);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const uploadAsset = React.useCallback(
    async (folder: AdminMediaFolder, file: File) => {
      const formData = new FormData();
      formData.append("folder", folder);
      formData.append("file", file);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media.");
      }

      const body = (await response.json()) as ApiResponse<MediaAsset>;
      await refresh();
      return body.data;
    },
    [refresh],
  );

  const renameAsset = React.useCallback(
    async (id: string, fileName: string) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fileName}),
      });

      if (!response.ok) {
        throw new Error("Failed to rename media.");
      }

      const body = (await response.json()) as ApiResponse<MediaAsset>;
      await refresh();
      return body.data;
    },
    [refresh],
  );

  const replaceAsset = React.useCallback(
    async (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/media/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to replace media.");
      }

      const body = (await response.json()) as ApiResponse<MediaAsset>;
      await refresh();
      return body.data;
    },
    [refresh],
  );

  const deleteAsset = React.useCallback(
    async (id: string) => {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media.");
      }

      await refresh();
    },
    [refresh],
  );

  return {
    assets,
    isLoading,
    refresh,
    uploadAsset,
    renameAsset,
    replaceAsset,
    deleteAsset,
  };
}
