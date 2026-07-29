import {NextRequest, NextResponse} from "next/server";
import {createHash} from "node:crypto";

import {FieldValue} from "firebase-admin/firestore";

import {getAdminDb} from "@/lib/firebase/admin";
import {createReviewSchema, reviewQuerySchema} from "@/lib/schemas/reviews";
import type {ApiResponse, ReviewListResponse, ReviewRating} from "@/lib/types/reviews";
import {createReview, listPublicReviews} from "@/services/firestore/review-service";

export const runtime = "nodejs";

const LIKED_COOKIE_NAME = "ac_review_liked";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const REVIEW_RATE_LIMIT_COLLECTION = "reviewSubmissionLocks";
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

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

function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip");
  return forwarded?.split(",")[0]?.trim() ?? "0.0.0.0";
}

function hashRateLimitKey(ip: string): string {
  const salt = process.env.REVIEW_RATE_LIMIT_SALT ?? TURNSTILE_SECRET_KEY ?? "alicutz-review-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<void> {
  if (!TURNSTILE_SECRET_KEY) {
    return;
  }

  if (!token) {
    throw new Error("Turnstile verification is required.");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });

  const payload = (await response.json()) as {success?: boolean; "error-codes"?: string[]};

  if (!payload.success) {
    throw new Error("Turnstile verification failed.");
  }
}

async function enforceReviewRateLimit(ip: string): Promise<void> {
  const db = getAdminDb();
  const rateLimitKey = hashRateLimitKey(ip);
  const docRef = db.collection(REVIEW_RATE_LIMIT_COLLECTION).doc(rateLimitKey);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const lastSubmittedAt = snapshot.get("lastSubmittedAt") as {toDate?: () => Date} | undefined;
    const lastSubmittedTime = lastSubmittedAt && typeof lastSubmittedAt.toDate === "function" ? lastSubmittedAt.toDate().getTime() : 0;

    if (lastSubmittedTime && Date.now() - lastSubmittedTime < RATE_LIMIT_WINDOW_MS) {
      throw new Error("Please wait 24 hours before submitting another review.");
    }

    transaction.set(
      docRef,
      {
        lastSubmittedAt: FieldValue.serverTimestamp(),
        ipHash: rateLimitKey,
      },
      {merge: true},
    );
  });
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
    if ((payload.honeypot ?? "").trim().length > 0) {
      throw new Error("Submission blocked.");
    }

    const clientIp = getClientIp(req);
    await verifyTurnstile(payload.turnstileToken, clientIp);
    await enforceReviewRateLimit(clientIp);

    const languageCode = payload.languageCode ?? detectLanguageCode(req);
    const countryCode = payload.countryCode ?? detectCountryCode(req);
    const language = payload.language ?? LANGUAGE_LABELS[languageCode] ?? "English";
    const email = buildSyntheticEmail(sanitizeInput(payload.customerName), sanitizeInput(payload.review));

    const created = await createReview({
      ...payload,
      customerName: sanitizeInput(payload.customerName),
      review: sanitizeInput(payload.review),
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
