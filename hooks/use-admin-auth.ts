"use client";

import { useEffect, useState } from "react";

import { subscribeToAdminAuthState } from "@/lib/firebase/auth";
import { hasRequiredRole } from "@/services/auth/rbac";
import type { AuthenticatedUser, UserRole } from "@/types/auth";

export interface UseAdminAuthResult {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthorized: boolean;
}

export function useAdminAuth(requiredRoles: readonly UserRole[] = ["admin"]): UseAdminAuthResult {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAdminAuthState((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    isAuthorized: hasRequiredRole(user?.role, requiredRoles),
  };
}
