import {NextRequest, NextResponse} from "next/server";

import {updateReviewSchema} from "@/lib/schemas/reviews";
import type {ApiResponse, ReviewDocument} from "@/lib/types/reviews";
import {applyAdminReviewAction, deleteReview, getReviewById} from "@/services/firestore/review-service";
import {requireAdmin} from "@/services/auth/require-admin";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<ReviewDocument>>> {
  try {
    const {id} = await params;
    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json({success: false, message: "Review not found."}, {status: 404});
    }

    return NextResponse.json({success: true, data: review}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch review.",
      },
      {status: 400},
    );
  }
}

export async function PUT(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id} = await params;
    const payload = updateReviewSchema.parse(await req.json());
    const updated = await applyAdminReviewAction(id, "edit", payload);

    return NextResponse.json({success: true, data: updated}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update review.",
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
