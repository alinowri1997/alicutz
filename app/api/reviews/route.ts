import {NextRequest, NextResponse} from "next/server";

import {createReviewSchema, reviewQuerySchema} from "@/lib/schemas/reviews";
import type {ApiResponse, ReviewListResponse, ReviewRating} from "@/lib/types/reviews";
import {createReview, listPublicReviews} from "@/services/firestore/review-service";

export const runtime = "nodejs";

const LIKED_COOKIE_NAME = "ac_review_liked";

function parseLikedCookie(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ReviewListResponse>>> {
  try {
    const parsed = reviewQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    const likedIds = parseLikedCookie(req.cookies.get(LIKED_COOKIE_NAME)?.value);

    const data = await listPublicReviews(
      {
        page: parsed.page,
        limit: parsed.limit,
        search: parsed.search,
        rating: parsed.rating as ReviewRating | undefined,
        verified: parsed.verified,
        withPhotos: parsed.withPhotos,
        featured: parsed.featured,
        service: parsed.service,
        sort: parsed.sort,
      },
      likedIds,
    );

    return NextResponse.json({success: true, data}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch reviews.",
      },
      {status: 400},
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{id: string}>>> {
  try {
    const payload = createReviewSchema.parse(await req.json());
    const created = await createReview({
      ...payload,
      rating: payload.rating as ReviewRating,
    });

    return NextResponse.json({success: true, data: created}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create review.",
      },
      {status: 400},
    );
  }
}
