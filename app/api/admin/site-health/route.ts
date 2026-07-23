import {NextResponse} from "next/server";

import {requireAdmin} from "@/services/auth/require-admin";
import {runSiteHealthChecks} from "@/services/site-health/site-health-service";

export async function GET(): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const data = await runSiteHealthChecks();
  return NextResponse.json({success: true, data}, {status: 200});
}
