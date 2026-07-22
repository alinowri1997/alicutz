import "server-only";

import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES, AUTH_ROLES } from "@/config/firebase";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { AdminSessionPayload, UserRole } from "@/types/auth";

const DEFAULT_SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000;

export async function createAdminSession(idToken: string): Promise<void> {
  const adminAuth = getAdminAuth();
  const expiresIn = DEFAULT_SESSION_EXPIRES_IN_MS;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
  const token = await adminAuth.verifyIdToken(idToken);
  const role = (token.role as UserRole | undefined) ?? AUTH_ROLES.admin;

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAMES.session, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });

  cookieStore.set(AUTH_COOKIE_NAMES.role, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAMES.session);
  cookieStore.delete(AUTH_COOKIE_NAMES.role);
}

export async function getCurrentAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAMES.session)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = (decoded.role as UserRole | undefined) ?? AUTH_ROLES.admin;

    return {
      uid: decoded.uid,
      email: decoded.email,
      role,
    };
  } catch {
    return null;
  }
}
