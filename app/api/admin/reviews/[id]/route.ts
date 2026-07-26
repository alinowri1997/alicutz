import {NextRequest, NextResponse} from "next/server";

import {reviewModerationActionSchema} from "@/lib/schemas/reviews";
import {applyAdminReviewAction, deleteReview} from "@/services/firestore/review-service";
import {requireAdmin} from "@/services/auth/require-admin";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    const body = reviewModerationActionSchema.parse(await req.json());

    if (body.action === "delete") {
      await deleteReview(id);
      return NextResponse.json({success: true, message: "Review deleted."}, {status: 200});
    }

    const updated = await applyAdminReviewAction(
      id,
      body.action,
      body.payload as Record<string, unknown> | undefined,
    );

    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to apply moderation action.",
      },
      {status: 400},
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    await deleteReview(id);
    return NextResponse.json({success: true, data: null}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete review.",
      },
      {status: 400},
    );
  }
}
