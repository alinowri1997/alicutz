import { NextRequest, NextResponse } from "next/server";

import {
  clearAdminSession,
  createAdminSession,
  getCurrentAdminSession,
} from "@/services/auth/admin-session-service";
import {createActivityLog} from "@/services/firestore/activity-log-service";

export const runtime = "nodejs";

interface CreateSessionBody {
  idToken?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as CreateSessionBody;

    if (!body.idToken) {
      return NextResponse.json({ success: false, message: "idToken is required." }, { status: 400 });
    }

    await createAdminSession(body.idToken);
    const session = await getCurrentAdminSession();

    if (session) {
      await createActivityLog({
        session,
        action: "auth.login",
        targetType: "auth",
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const details = error instanceof Error
      ? {
          code: (error as Error & { code?: string }).code,
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          message: String(error),
        };

    console.error("[api-admin-session] POST failed", {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hasProjectId: Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      hasClientEmail: Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
      hasPrivateKey: Boolean(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
      errorCode: details.code,
      errorName: details.name,
      errorMessage: details.message,
      errorStack: details.stack,
    });
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create session.",
      },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const session = await getCurrentAdminSession();

  if (!session) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: session }, { status: 200 });
}

export async function DELETE(): Promise<NextResponse> {
  const session = await getCurrentAdminSession();

  if (session) {
    await createActivityLog({
      session,
      action: "auth.logout",
      targetType: "auth",
    });
  }

  await clearAdminSession();
  return NextResponse.json({ success: true }, { status: 200 });
}
