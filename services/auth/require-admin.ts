import "server-only";

import {NextResponse} from "next/server";

import {AUTH_ROLES, isAdminAuthDisabled} from "@/config/firebase";
import {getCurrentAdminSession} from "@/services/auth/admin-session-service";
import {hasRequiredRole} from "@/services/auth/rbac";
import type {AdminSessionPayload} from "@/types/auth";

export interface RequireAdminSuccess {
  ok: true;
  session: AdminSessionPayload;
}

export interface RequireAdminFailure {
  ok: false;
  response: NextResponse;
}

export async function requireAdmin(): Promise<RequireAdminSuccess | RequireAdminFailure> {
  if (isAdminAuthDisabled()) {
    return {
      ok: true,
      session: {
        uid: "local-admin",
        email: "admin@alicutz.local",
        role: AUTH_ROLES.admin,
      },
    };
  }

  const session = await getCurrentAdminSession();

  if (!session || !hasRequiredRole(session.role, ["admin"])) {
    return {
      ok: false,
      response: NextResponse.json({success: false, message: "Unauthorized"}, {status: 401}),
    };
  }

  return {ok: true, session};
}
