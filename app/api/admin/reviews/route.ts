import {NextRequest, NextResponse} from "next/server";

import {adminReviewQuerySchema} from "@/lib/schemas/reviews";
import {listAdminReviews} from "@/services/firestore/review-service";
import {requireAdmin} from "@/services/auth/require-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const query = adminReviewQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    const data = await listAdminReviews(query.status, query.search, query.limit);

    return NextResponse.json({success: true, data}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch admin reviews.",
      },
      {status: 400},
    );
  }
}
