import {NextRequest, NextResponse} from "next/server";

import type {ApiResponse, ReviewImage} from "@/lib/types/reviews";
import {uploadReviewImage} from "@/services/firestore/review-service";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<ReviewImage>>> {
  try {
    const {id} = await params;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({success: false, message: "Image file is required."}, {status: 400});
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({success: false, message: "Only image uploads are allowed."}, {status: 400});
    }

    const uploaded = await uploadReviewImage(id, file);
    return NextResponse.json({success: true, data: uploaded}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload review image.",
      },
      {status: 400},
    );
  }
}
