import {NextRequest, NextResponse} from "next/server";

import {requireAdmin} from "@/services/auth/require-admin";
import {createActivityLog, listActivityLogs} from "@/services/firestore/activity-log-service";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 50;

  const data = await listActivityLogs(Number.isNaN(limit) ? 50 : Math.min(Math.max(limit, 1), 200));
  return NextResponse.json({success: true, data}, {status: 200});
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as {
      action: string;
      targetType: string;
      targetId?: string;
      targetSection?: string;
      metadata?: Record<string, unknown>;
    };

    await createActivityLog({
      session: auth.session,
      action: body.action,
      targetType: body.targetType,
      targetId: body.targetId,
      targetSection: body.targetSection,
      metadata: body.metadata,
    });

    return NextResponse.json({success: true}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create activity log.",
      },
      {status: 400},
    );
  }
}
