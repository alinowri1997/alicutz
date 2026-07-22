"use client";

import * as React from "react";

import type {AdminContentSection, CmsDocument, WorkflowAction} from "@/types/admin-cms";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UseAdminContentResult<T extends object> {
  items: Array<CmsDocument<T>>;
  isLoading: boolean;
  refresh: () => Promise<void>;
  createItem: (data: T, id?: string) => Promise<CmsDocument<T>>;
  updateItem: (id: string, data: Partial<T>) => Promise<CmsDocument<T>>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (ids: string[]) => Promise<void>;
  applyWorkflow: (id: string, action: WorkflowAction) => Promise<CmsDocument<T>>;
}

export function useAdminContent<T extends object>(
  section: AdminContentSection,
): UseAdminContentResult<T> {
  const [items, setItems] = React.useState<Array<CmsDocument<T>>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const response = await fetch(`/api/admin/content/${section}`, {credentials: "include"});

    if (!response.ok) {
      throw new Error(`Failed to load ${section}.`);
    }

    const body = (await response.json()) as ApiResponse<Array<CmsDocument<T>>>;
    setItems(body.data ?? []);
  }, [section]);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch(`/api/admin/content/${section}`, {credentials: "include"});

        if (!response.ok) {
          if (isMounted) {
            setItems([]);
          }
          return;
        }

        const body = (await response.json()) as ApiResponse<Array<CmsDocument<T>>>;

        if (isMounted) {
          setItems(body.data ?? []);
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
  }, [section]);

  const createItem = React.useCallback(
    async (data: T, id?: string) => {
      const response = await fetch(`/api/admin/content/${section}`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({data, id}),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${section}.`);
      }

      const body = (await response.json()) as ApiResponse<CmsDocument<T>>;
      await refresh();
      return body.data;
    },
    [refresh, section],
  );

  const updateItem = React.useCallback(
    async (id: string, data: Partial<T>) => {
      const response = await fetch(`/api/admin/content/${section}/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({data}),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${section}.`);
      }

      const body = (await response.json()) as ApiResponse<CmsDocument<T>>;
      await refresh();
      return body.data;
    },
    [refresh, section],
  );

  const deleteItem = React.useCallback(
    async (id: string) => {
      const response = await fetch(`/api/admin/content/${section}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${section}.`);
      }

      await refresh();
    },
    [refresh, section],
  );

  const reorderItems = React.useCallback(
    async (ids: string[]) => {
      const response = await fetch(`/api/admin/content/${section}`, {
        method: "PATCH",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action: "reorder", ids}),
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder ${section}.`);
      }

      await refresh();
    },
    [refresh, section],
  );

  const applyWorkflow = React.useCallback(
    async (id: string, action: WorkflowAction) => {
      const response = await fetch(`/api/admin/content/${section}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action}),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} for ${section}.`);
      }

      const body = (await response.json()) as ApiResponse<CmsDocument<T>>;
      await refresh();
      return body.data;
    },
    [refresh, section],
  );

  return {
    items,
    isLoading,
    refresh,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    applyWorkflow,
  };
}
