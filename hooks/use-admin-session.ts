"use client";

import * as React from "react";

import {isAdminAuthDisabled} from "@/config/firebase";
import {sendAdminPasswordReset, signInAdminWithEmailPassword, signOutAdmin} from "@/lib/firebase";
import type {AdminSessionPayload} from "@/types/auth";

interface SessionResponse {
  success: boolean;
  user: AdminSessionPayload | null;
}

export interface UseAdminSessionResult {
  user: AdminSessionPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
}

async function fetchSession(): Promise<AdminSessionPayload | null> {
  const response = await fetch("/api/admin/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as SessionResponse;
  return body.user;
}

export function useAdminSession(): UseAdminSessionResult {
  const adminAuthDisabled = isAdminAuthDisabled();
  const [user, setUser] = React.useState<AdminSessionPayload | null>(() =>
    adminAuthDisabled
      ? {
          uid: "local-admin",
          email: "admin@alicutz.local",
          role: "admin",
        }
      : null,
  );
  const [isLoading, setIsLoading] = React.useState(!adminAuthDisabled);

  const refresh = React.useCallback(async () => {
    const nextUser = await fetchSession();
    setUser(nextUser);
  }, []);

  React.useEffect(() => {
    if (adminAuthDisabled) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      try {
        const nextUser = await fetchSession();
        if (isMounted) {
          setUser(nextUser);
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
  }, [adminAuthDisabled]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    if (adminAuthDisabled) {
      setUser({
        uid: "local-admin",
        email: email || "admin@alicutz.local",
        role: "admin",
      });
      return;
    }

    const userCredential = await signInAdminWithEmailPassword(email, password);
    const idToken = await userCredential.getIdToken();

    const sessionResponse = await fetch("/api/admin/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({idToken}),
    });

    if (!sessionResponse.ok) {
      throw new Error("Unable to create admin session.");
    }

    await refresh();
  }, [adminAuthDisabled, refresh]);

  const signOut = React.useCallback(async () => {
    if (adminAuthDisabled) {
      return;
    }

    await signOutAdmin();

    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "include",
    });

    setUser(null);
  }, [adminAuthDisabled]);

  const forgotPassword = React.useCallback(async (email: string) => {
    if (adminAuthDisabled) {
      return;
    }

    await sendAdminPasswordReset(email);
  }, [adminAuthDisabled]);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signOut,
    forgotPassword,
    refresh,
  };
}
