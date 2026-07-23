"use client";

import * as React from "react";

import type {ActivityLogEntry} from "@/types/admin-cms";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useAdminActivity(limit: number = 25) {
  const [items, setItems] = React.useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const response = await fetch(`/api/admin/activity?limit=${limit}`, {credentials: "include"});

    if (!response.ok) {
      throw new Error("Failed to load activity logs.");
    }

    const body = (await response.json()) as ApiResponse<ActivityLogEntry[]>;
    setItems(body.data ?? []);
  }, [limit]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch(`/api/admin/activity?limit=${limit}`, {credentials: "include"});
        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as ApiResponse<ActivityLogEntry[]>;
        if (mounted) {
          setItems(body.data ?? []);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return {items, isLoading, refresh};
}
