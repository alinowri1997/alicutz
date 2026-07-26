import {NextRequest, NextResponse} from "next/server";

import {reviewReplySchema} from "@/lib/schemas/reviews";
import type {ApiResponse, ReviewReply} from "@/lib/types/reviews";
import {applyAdminReviewAction, getReviewById} from "@/services/firestore/review-service";
import {requireAdmin} from "@/services/auth/require-admin";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<ReviewReply[]>>> {
  try {
    const {id} = await params;
    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json({success: false, message: "Review not found."}, {status: 404});
    }

    return NextResponse.json({success: true, data: review.reply ? [review.reply] : []}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch replies.",
      },
      {status: 400},
    );
  }
}

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    const payload = reviewReplySchema.parse(await req.json());
    const updated = await applyAdminReviewAction(id, "reply", payload);

    if (!updated.reply) {
      throw new Error("Reply was not saved.");
    }

    return NextResponse.json({success: true, data: updated.reply}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create reply.",
      },
      {status: 400},
    );
  }
}
