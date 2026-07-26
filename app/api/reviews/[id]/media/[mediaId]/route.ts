import {NextRequest, NextResponse} from "next/server";

import {deleteReviewImage, getReviewById} from "@/services/firestore/review-service";
import {requireAdmin} from "@/services/auth/require-admin";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  {params}: {params: Promise<{id: string; mediaId: string}>},
): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const {id, mediaId} = await params;
    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json({success: false, message: "Review not found."}, {status: 404});
    }

    const image = review.images[Number(mediaId)];
    if (!image) {
      return NextResponse.json({success: false, message: "Image not found."}, {status: 404});
    }

    await deleteReviewImage(id, image.path);
    return NextResponse.json({success: true, data: null}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete image.",
      },
      {status: 400},
    );
  }
}
