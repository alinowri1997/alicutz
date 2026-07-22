import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/services/auth/admin-session-service";
import { hasRequiredRole } from "@/services/auth/rbac";

export async function GET(): Promise<NextResponse> {
  const session = await getCurrentAdminSession();

  if (!session || !hasRequiredRole(session.role, ["admin"])) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: session }, { status: 200 });
}
