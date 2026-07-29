import {NextRequest, NextResponse} from "next/server";
import {createHash} from "node:crypto";

import {createReviewSchema, reviewQuerySchema} from "@/lib/schemas/reviews";
import type {ApiResponse, ReviewListResponse, ReviewRating} from "@/lib/types/reviews";
import {createReview, listPublicReviews} from "@/services/firestore/review-service";

export const runtime = "nodejs";

const LIKED_COOKIE_NAME = "ac_review_liked";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  ar: "Arabic",
  fa: "Persian",
  ru: "Russian",
};

function normalizeCountryCode(value: string | null | undefined): string | undefined {
  const code = value?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) {
    return undefined;
  }

  return code;
}

function detectCountryCode(req: NextRequest): string {
  const headerCountry = normalizeCountryCode(
    req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? req.headers.get("x-country"),
  );

  if (headerCountry) {
    return headerCountry;
  }

  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const locale = acceptLanguage.split(",")[0]?.trim() ?? "tr-TR";
  const region = locale.split("-")[1]?.toUpperCase();

  return normalizeCountryCode(region) ?? "TR";
}

function detectLanguageCode(req: NextRequest): string {
  const acceptLanguage = req.headers.get("accept-language") ?? "en";
  const locale = acceptLanguage.split(",")[0]?.trim() ?? "en";
  const code = locale.split("-")[0]?.toLowerCase() ?? "en";

  return /^[a-z]{2}$/.test(code) ? code : "en";
}

function buildSyntheticEmail(customerName: string, review: string): string {
  const digest = createHash("sha1").update(`${customerName}:${review}`).digest("hex").slice(0, 12);
  const safeName = customerName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  return `${safeName || "guest"}.${digest}@alicutz.review`;
}

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
    const languageCode = payload.languageCode ?? detectLanguageCode(req);
    const countryCode = payload.countryCode ?? detectCountryCode(req);
    const language = payload.language ?? LANGUAGE_LABELS[languageCode] ?? "English";
    const email = payload.email ?? buildSyntheticEmail(payload.customerName, payload.review);

    const created = await createReview({
      ...payload,
      email,
      countryCode,
      languageCode,
      language,
      service: payload.service ?? "Home Service",
      visitDate: payload.visitDate ?? new Date().toISOString().slice(0, 10),
      tags: payload.tags ?? [],
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
