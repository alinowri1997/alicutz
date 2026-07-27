import { NextResponse } from "next/server";

import {isAdminAuthDisabled} from "@/config/firebase";
import { getCurrentAdminSession } from "@/services/auth/admin-session-service";
import { hasRequiredRole } from "@/services/auth/rbac";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  if (isAdminAuthDisabled()) {
    return NextResponse.json(
      {
        success: true,
        user: {
          uid: "local-admin",
          email: "admin@alicutz.local",
          role: "admin",
        },
      },
      { status: 200 },
    );
  }

  const session = await getCurrentAdminSession();

  if (!session || !hasRequiredRole(session.role, ["admin"])) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: session }, { status: 200 });
}
