import {randomUUID} from "node:crypto";

import {NextRequest, NextResponse} from "next/server";

import type {ApiResponse} from "@/lib/types/reviews";
import {likeReview, unlikeReview} from "@/services/firestore/review-service";

export const runtime = "nodejs";

const VISITOR_COOKIE = "ac_review_visitor";
const LIKED_COOKIE = "ac_review_liked";

function parseLiked(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }

  return new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
}

function serializeLiked(set: Set<string>): string {
  return Array.from(set).join(",");
}

function getOrCreateVisitorId(req: NextRequest): string {
  return req.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();
}

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<{likes: number}>>> {
  try {
    const {id} = await params;
    const visitorId = getOrCreateVisitorId(req);
    const likes = await likeReview(id, visitorId);

    const likedSet = parseLiked(req.cookies.get(LIKED_COOKIE)?.value);
    likedSet.add(id);

    const response = NextResponse.json({success: true, data: {likes}}, {status: 200});
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    response.cookies.set(LIKED_COOKIE, serializeLiked(likedSet), {
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
        message: error instanceof Error ? error.message : "Failed to like review.",
      },
      {status: 400},
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<ApiResponse<{likes: number}>>> {
  try {
    const {id} = await params;
    const visitorId = req.cookies.get(VISITOR_COOKIE)?.value;

    if (!visitorId) {
      return NextResponse.json({success: true, data: {likes: 0}}, {status: 200});
    }

    const likes = await unlikeReview(id, visitorId);
    const likedSet = parseLiked(req.cookies.get(LIKED_COOKIE)?.value);
    likedSet.delete(id);

    const response = NextResponse.json({success: true, data: {likes}}, {status: 200});
    response.cookies.set(LIKED_COOKIE, serializeLiked(likedSet), {
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
        message: error instanceof Error ? error.message : "Failed to unlike review.",
      },
      {status: 400},
    );
  }
}
