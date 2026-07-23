"use client";

import * as React from "react";

import type {SiteHealthCheck} from "@/types/admin-cms";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useSiteHealth() {
  const [items, setItems] = React.useState<SiteHealthCheck[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const response = await fetch("/api/admin/site-health", {credentials: "include"});
    if (!response.ok) {
      throw new Error("Failed to load site health checks.");
    }

    const body = (await response.json()) as ApiResponse<SiteHealthCheck[]>;
    setItems(body.data ?? []);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/site-health", {credentials: "include"});

        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as ApiResponse<SiteHealthCheck[]>;
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
  }, []);

  return {items, isLoading, refresh};
}
