import {randomUUID} from "node:crypto";

import {NextRequest, NextResponse} from "next/server";

import {reportReviewSchema} from "@/lib/schemas/reviews";
import type {ApiResponse} from "@/lib/types/reviews";
import {reportReview} from "@/services/firestore/review-service";

export const runtime = "nodejs";

const VISITOR_COOKIE = "ac_review_visitor";

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const {id} = await params;
    const payload = reportReviewSchema.parse(await req.json());
    const visitorId = req.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();

    await reportReview(id, visitorId, payload);

    const response = NextResponse.json({success: true, data: null}, {status: 201});
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to report review.",
      },
      {status: 400},
    );
  }
}
