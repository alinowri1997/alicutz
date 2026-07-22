import { NextRequest, NextResponse } from "next/server";

import {
  clearAdminSession,
  createAdminSession,
  getCurrentAdminSession,
} from "@/services/auth/admin-session-service";

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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
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
  await clearAdminSession();
  return NextResponse.json({ success: true }, { status: 200 });
}
