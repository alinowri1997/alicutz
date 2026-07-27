import "server-only";

import {randomUUID} from "node:crypto";

import {FieldValue, Timestamp} from "firebase-admin/firestore";

import {getFirebaseAdminConfig} from "@/config/firebase";
import {getAdminDb, getAdminStorage} from "@/lib/firebase/admin";
import type {
  AdminReviewDashboard,
  AdminReviewListResponse,
  CreateReviewInput,
  PublicReview,
  ReplyReviewInput,
  ReportReviewInput,
  ReviewDocument,
  ReviewImage,
  ReviewListResponse,
  ReviewQuery,
  ReviewService,
  ReviewSort,
  ReviewStatus,
  UpdateReviewInput,
} from "@/lib/types/reviews";

const REVIEWS_COLLECTION = "reviews";
const REVIEW_LIKES_COLLECTION = "reviewLikes";
const REVIEW_REPORTS_COLLECTION = "reviewReports";
const ADMIN_NOTIFICATIONS_COLLECTION = "adminNotifications";

const PROFANITY_PATTERNS = [
  /\b(?:fuck|shit|bitch|asshole|bastard|dick|slut|whore)\b/i,
  /\b(?:amk|aq|siktir|orospu|pi[cç])\b/i,
];

const AD_PATTERNS = [
  /\b(?:discount|promo|coupon|buy now|subscribe|followers?)\b/i,
  /\b(?:whatsapp me|telegram|crypto|casino|bet)\b/i,
];

const LINK_PATTERN = /(https?:\/\/|www\.|[\w.-]+\.[a-z]{2,})/i;

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchText(input: Pick<CreateReviewInput, "customerName" | "review" | "service">): string {
  return normalizeText(`${input.customerName} ${input.review} ${input.service}`);
}

function buildTimeAgo(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const deltaMs = Math.max(0, now - then);
  const minutes = Math.floor(deltaMs / (1000 * 60));

  if (minutes < 60) {
    return `${Math.max(1, minutes)} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function mapReviewDocument(id: string, raw: FirebaseFirestore.DocumentData | undefined): ReviewDocument {
  const source = raw ?? {};

  return {
    id,
    customerName: source.customerName ?? "Anonymous",
    email: source.email ?? "",
    countryCode: source.countryCode ?? undefined,
    languageCode: source.languageCode ?? source.language ?? "",
    language: source.language ?? "",
    avatar: source.avatar,
    rating: source.rating ?? 5,
    service: source.service ?? "Other",
    review: source.review ?? "",
    tags: Array.isArray(source.tags) ? source.tags : [],
    images: Array.isArray(source.images) ? source.images : [],
    likes: typeof source.likes === "number" ? source.likes : 0,
    helpfulVotes: typeof source.helpfulVotes === "number" ? source.helpfulVotes : typeof source.likes === "number" ? source.likes : 0,
    notHelpfulVotes: typeof source.notHelpfulVotes === "number" ? source.notHelpfulVotes : 0,
    verified: Boolean(source.verified),
    featured: Boolean(source.featured),
    approved: Boolean(source.approved),
    hidden: Boolean(source.hidden),
    status: (source.status ?? "pending") as ReviewStatus,
    recommendation: source.recommendation ?? source.rating >= 4,
    visitDate: source.visitDate,
    reply: source.reply,
    replyDate: source.replyDate,
    reportedCount: typeof source.reportedCount === "number" ? source.reportedCount : 0,
    reports: Array.isArray(source.reports) ? source.reports : [],
    spamScore: typeof source.spamScore === "number" ? source.spamScore : 0,
    searchText: source.searchText ?? "",
    createdAt: toIsoString(source.createdAt),
    updatedAt: toIsoString(source.updatedAt),
  };
}

function computeSpamRejectionReason(input: CreateReviewInput): string | null {
  const normalized = normalizeText(input.review);

  if (normalized.length === 0) {
    return "Review content cannot be empty.";
  }

  if (LINK_PATTERN.test(input.review)) {
    return "External links are not allowed in reviews.";
  }

  if (PROFANITY_PATTERNS.some((pattern) => pattern.test(input.review))) {
    return "Review contains language that is not allowed.";
  }

  if (AD_PATTERNS.some((pattern) => pattern.test(input.review))) {
    return "Promotional content is not allowed.";
  }

  const compact = input.review.replace(/\s/g, "");
  if (/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})+$/u.test(compact)) {
    return "Review cannot contain only emojis.";
  }

  const words = normalized.split(" ");
  const uniqueWords = new Set(words);
  if (words.length > 12 && uniqueWords.size <= 3) {
    return "Review appears to be repeated text.";
  }

  return null;
}

async function createNotification(type: "new_review" | "reported_review" | "pending_review", reviewId: string, title: string): Promise<void> {
  await getAdminDb().collection(ADMIN_NOTIFICATIONS_COLLECTION).add({
    type,
    reviewId,
    title,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

let cachedBucketName: string | null = null;

function resolveBucketCandidates(): string[] {
  const adminProjectId = getFirebaseAdminConfig().projectId;

  return [
    process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    adminProjectId ? `${adminProjectId}.firebasestorage.app` : undefined,
    adminProjectId ? `${adminProjectId}.appspot.com` : undefined,
  ].filter((entry): entry is string => Boolean(entry));
}

function resolveReviewBucket() {
  if (cachedBucketName) {
    return getAdminStorage().bucket(cachedBucketName);
  }

  const candidates = resolveBucketCandidates();
  return getAdminStorage().bucket(candidates[0]);
}

async function uploadToFirstAvailableBucket(
  relativePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<{bucketName: string; fullPath: string}> {
  const storage = getAdminStorage();
  const candidates = resolveBucketCandidates();

  if (candidates.length === 0) {
    throw new Error("No Firebase Storage bucket configured.");
  }

  for (const candidate of candidates) {
    const bucket = storage.bucket(candidate);
    const storageFile = bucket.file(relativePath);

    try {
      await storageFile.save(buffer, {
        metadata: {
          contentType,
          cacheControl: "public, max-age=31536000",
        },
        resumable: false,
      });
      await storageFile.makePublic();
      cachedBucketName = candidate;
      return {bucketName: candidate, fullPath: storageFile.name};
    } catch {
      continue;
    }
  }

  throw new Error("No valid Firebase Storage bucket found for review uploads.");
}

async function fetchApprovedReviews(limit = 400): Promise<ReviewDocument[]> {
  const snapshot = await getAdminDb()
    .collection(REVIEWS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .map((doc) => mapReviewDocument(doc.id, doc.data()))
    .filter((review) => review.approved && !review.hidden);
}

function applyFilters(reviews: ReviewDocument[], query: ReviewQuery): ReviewDocument[] {
  let next = [...reviews];

  if (query.search) {
    const search = normalizeText(query.search);
    next = next.filter((review) => review.searchText.includes(search));
  }

  if (query.rating) {
    next = next.filter((review) => review.rating === query.rating);
  }

  if (query.verified) {
    next = next.filter((review) => review.verified);
  }

  if (query.withPhotos) {
    next = next.filter((review) => review.images.length > 0);
  }

  if (query.featured) {
    next = next.filter((review) => review.featured);
  }

  if (query.service) {
    next = next.filter((review) => review.service === query.service);
  }

  return next;
}

function sortReviews(reviews: ReviewDocument[], sort: ReviewSort): ReviewDocument[] {
  const next = [...reviews];

  const byDate = (a: ReviewDocument, b: ReviewDocument) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  if (sort === "oldest") {
    next.sort((a, b) => byDate(a, b));
  } else if (sort === "highestRating") {
    next.sort((a, b) => b.rating - a.rating || byDate(b, a));
  } else if (sort === "lowestRating") {
    next.sort((a, b) => a.rating - b.rating || byDate(b, a));
  } else if (sort === "mostHelpful" || sort === "mostLiked") {
    next.sort((a, b) => {
      const scoreA = a.likes + (a.featured ? 20 : 0) + (a.verified ? 10 : 0);
      const scoreB = b.likes + (b.featured ? 20 : 0) + (b.verified ? 10 : 0);
      return scoreB - scoreA || byDate(b, a);
    });
  } else {
    next.sort((a, b) => byDate(b, a));
  }

  next.sort((a, b) => {
    if (a.featured === b.featured) {
      return 0;
    }

    return a.featured ? -1 : 1;
  });

  return next;
}

function buildStats(allApproved: ReviewDocument[]): {
  averageRating: number;
  totalReviews: number;
  recommendationPercentage: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  verifiedReviews: number;
  withPhotos: number;
} {
  const total = allApproved.length;
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let ratingSum = 0;
  let recommended = 0;
  let verified = 0;
  let withPhotos = 0;

  allApproved.forEach((review) => {
    distribution[review.rating] += 1;
    ratingSum += review.rating;
    if (review.recommendation) {
      recommended += 1;
    }
    if (review.verified) {
      verified += 1;
    }
    if (review.images.length > 0) {
      withPhotos += 1;
    }
  });

  return {
    averageRating: total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0,
    totalReviews: total,
    recommendationPercentage: total > 0 ? Math.round((recommended / total) * 100) : 0,
    ratingDistribution: distribution,
    verifiedReviews: verified,
    withPhotos,
  };
}

export async function listPublicReviews(query: ReviewQuery, likedIds: Set<string>): Promise<ReviewListResponse> {
  const allApproved = await fetchApprovedReviews();
  const filtered = sortReviews(applyFilters(allApproved, query), query.sort);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const offset = (query.page - 1) * query.limit;
  const paged = filtered.slice(offset, offset + query.limit);

  const reviews: PublicReview[] = paged.map((review) => ({
    ...review,
    userLiked: likedIds.has(review.id),
    userVote: likedIds.has(review.id) ? "helpful" : null,
    timeAgo: buildTimeAgo(review.createdAt),
  }));

  return {
    reviews,
    stats: buildStats(allApproved),
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    hasMore: query.page < totalPages,
  };
}

export async function createReview(input: CreateReviewInput): Promise<{id: string}> {
  const rejectionReason = computeSpamRejectionReason(input);
  if (rejectionReason) {
    throw new Error(rejectionReason);
  }

  const normalized = normalizeText(input.review);

  const duplicateSnapshot = await getAdminDb()
    .collection(REVIEWS_COLLECTION)
    .where("email", "==", input.email.toLowerCase())
    .where("searchText", "==", buildSearchText(input))
    .limit(1)
    .get();

  if (!duplicateSnapshot.empty) {
    throw new Error("Duplicate review detected.");
  }

  const docRef = await getAdminDb().collection(REVIEWS_COLLECTION).add({
    customerName: input.customerName,
    email: input.email.toLowerCase(),
    countryCode: input.countryCode?.toUpperCase() ?? null,
    languageCode: input.languageCode,
    language: input.language,
    rating: input.rating,
    service: input.service,
    review: input.review,
    tags: input.tags,
    images: [],
    likes: 0,
    helpfulVotes: 0,
    notHelpfulVotes: 0,
    verified: false,
    featured: false,
    approved: false,
    hidden: false,
    status: "pending",
    recommendation: input.rating >= 4,
    visitDate: input.visitDate ?? null,
    reply: null,
    replyDate: null,
    reportedCount: 0,
    reports: [],
    spamScore: normalized.length < 30 ? 25 : 0,
    searchText: buildSearchText(input),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await createNotification("new_review", docRef.id, `${input.customerName} submitted a new review`);
  await createNotification("pending_review", docRef.id, "A review is pending approval");

  return {id: docRef.id};
}

export async function uploadReviewImage(reviewId: string, file: File): Promise<ReviewImage> {
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const safeExt = extension.replace(/[^a-z0-9]/g, "");
  const filename = `${reviewId}/${Date.now()}-${randomUUID()}.${safeExt || "jpg"}`;

  const relativePath = `reviews/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const {bucketName, fullPath} = await uploadToFirstAvailableBucket(relativePath, buffer, file.type);

  const image: ReviewImage = {
    path: fullPath,
    url: `https://storage.googleapis.com/${bucketName}/${fullPath}`,
    size: file.size,
    approved: true,
  };

  await getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId).update({
    images: FieldValue.arrayUnion(image),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return image;
}

export async function deleteReviewImage(reviewId: string, path: string): Promise<void> {
  const reviewRef = getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId);
  const snapshot = await reviewRef.get();

  if (!snapshot.exists) {
    throw new Error("Review not found.");
  }

  const raw = snapshot.data();
  if (!raw) {
    throw new Error("Review data is unavailable.");
  }

  const review = mapReviewDocument(snapshot.id, raw);
  const nextImages = review.images.filter((item) => item.path !== path);

  const bucket = await resolveReviewBucket();
  await bucket.file(path).delete({ignoreNotFound: true});

  await reviewRef.update({
    images: nextImages,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function likeReview(reviewId: string, visitorId: string): Promise<number> {
  const likeId = `${reviewId}_${visitorId}`;
  const likeRef = getAdminDb().collection(REVIEW_LIKES_COLLECTION).doc(likeId);
  const likeSnapshot = await likeRef.get();

  if (likeSnapshot.exists) {
    const reviewSnap = await getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId).get();
    if (!reviewSnap.exists) {
      throw new Error("Review not found.");
    }

    return mapReviewDocument(reviewSnap.id, reviewSnap.data()).likes;
  }

  const reviewRef = getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId);
  await getAdminDb().runTransaction(async (transaction) => {
    const reviewSnapshot = await transaction.get(reviewRef);
    if (!reviewSnapshot.exists) {
      throw new Error("Review not found.");
    }

    transaction.set(likeRef, {
      reviewId,
      visitorId,
      createdAt: FieldValue.serverTimestamp(),
    });

    transaction.update(reviewRef, {
      likes: FieldValue.increment(1),
      helpfulVotes: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const updated = await reviewRef.get();
  return mapReviewDocument(updated.id, updated.data()).likes;
}

export async function unlikeReview(reviewId: string, visitorId: string): Promise<number> {
  const likeId = `${reviewId}_${visitorId}`;
  const likeRef = getAdminDb().collection(REVIEW_LIKES_COLLECTION).doc(likeId);
  const likeSnapshot = await likeRef.get();
  const reviewRef = getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId);

  if (!likeSnapshot.exists) {
    const reviewSnap = await reviewRef.get();
    if (!reviewSnap.exists) {
      throw new Error("Review not found.");
    }

    return mapReviewDocument(reviewSnap.id, reviewSnap.data()).likes;
  }

  await getAdminDb().runTransaction(async (transaction) => {
    const reviewSnapshot = await transaction.get(reviewRef);
    if (!reviewSnapshot.exists) {
      throw new Error("Review not found.");
    }

    transaction.delete(likeRef);
    transaction.update(reviewRef, {
      likes: FieldValue.increment(-1),
      helpfulVotes: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const updated = await reviewRef.get();
  return mapReviewDocument(updated.id, updated.data()).likes;
}

export async function reportReview(reviewId: string, visitorId: string, input: ReportReviewInput): Promise<void> {
  const reportId = `${reviewId}_${visitorId}_${Date.now()}`;

  await getAdminDb().collection(REVIEW_REPORTS_COLLECTION).doc(reportId).set({
    reviewId,
    visitorId,
    reason: input.reason,
    details: input.details ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await getAdminDb().collection(REVIEWS_COLLECTION).doc(reviewId).update({
    reportedCount: FieldValue.increment(1),
    reports: FieldValue.arrayUnion({
      reason: input.reason,
      details: input.details ?? null,
      visitorId,
      createdAt: new Date().toISOString(),
    }),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await createNotification("reported_review", reviewId, "A review has been reported");
}

export async function getReviewById(id: string): Promise<ReviewDocument | null> {
  const snapshot = await getAdminDb().collection(REVIEWS_COLLECTION).doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  return mapReviewDocument(snapshot.id, snapshot.data());
}

export async function deleteReview(id: string): Promise<void> {
  const review = await getReviewById(id);
  if (!review) {
    throw new Error("Review not found.");
  }

  const bucket = await resolveReviewBucket();
  await Promise.all(review.images.map((image) => bucket.file(image.path).delete({ignoreNotFound: true})));

  await getAdminDb().collection(REVIEWS_COLLECTION).doc(id).delete();
}

export async function applyAdminReviewAction(
  id: string,
  action: "approve" | "reject" | "hide" | "pin" | "verify" | "edit" | "reply" | "deletePhoto",
  payload?: Record<string, unknown>,
): Promise<ReviewDocument> {
  const reviewRef = getAdminDb().collection(REVIEWS_COLLECTION).doc(id);
  const snapshot = await reviewRef.get();

  if (!snapshot.exists) {
    throw new Error("Review not found.");
  }

  const existing = mapReviewDocument(snapshot.id, snapshot.data());

  if (action === "approve") {
    await reviewRef.update({
      approved: true,
      hidden: false,
      status: "approved",
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "reject") {
    await reviewRef.update({
      approved: false,
      hidden: true,
      status: "rejected",
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "hide") {
    await reviewRef.update({
      hidden: true,
      approved: false,
      status: "hidden",
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "pin") {
    await reviewRef.update({
      featured: !existing.featured,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "verify") {
    await reviewRef.update({
      verified: !existing.verified,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "edit") {
    const updates = payload as UpdateReviewInput | undefined;
    if (!updates) {
      throw new Error("Edit payload is required.");
    }

    await reviewRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "reply") {
    const reply = payload as ReplyReviewInput | undefined;
    if (!reply?.message) {
      throw new Error("Reply message is required.");
    }

    await reviewRef.update({
      reply: {
        authorName: "Ali Cutz",
        authorRole: "Owner",
        message: reply.message,
        replyDate: new Date().toISOString(),
      },
      replyDate: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "deletePhoto") {
    const photoPayload = payload as {path?: string} | undefined;
    if (!photoPayload?.path) {
      throw new Error("Photo path is required.");
    }

    await deleteReviewImage(id, photoPayload.path);
  }

  const updated = await reviewRef.get();
  return mapReviewDocument(updated.id, updated.data());
}

function parseMonthLabel(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString("en-US", {month: "long", year: "numeric"});
}

function buildDashboardMetrics(reviews: ReviewDocument[]): AdminReviewDashboard {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  let pending = 0;
  let approved = 0;
  let hidden = 0;
  let featured = 0;
  let ratingSum = 0;
  let approvedCount = 0;
  let currentMonthCount = 0;
  let previousMonthCount = 0;
  let recommendationCount = 0;

  const serviceCount: Record<ReviewService, number> = {
    Haircut: 0,
    Fade: 0,
    Color: 0,
    Beard: 0,
    "Home Service": 0,
    Other: 0,
  };

  const monthCount = new Map<string, number>();

  reviews.forEach((review) => {
    if (review.status === "pending") {
      pending += 1;
    }
    if (review.approved && !review.hidden) {
      approved += 1;
      approvedCount += 1;
      ratingSum += review.rating;
      if (review.recommendation) {
        recommendationCount += 1;
      }
    }
    if (review.hidden || review.status === "hidden") {
      hidden += 1;
    }
    if (review.featured) {
      featured += 1;
    }

    serviceCount[review.service] += 1;

    const createdTime = new Date(review.createdAt).getTime();
    if (createdTime >= currentMonth) {
      currentMonthCount += 1;
    } else if (createdTime >= previousMonth && createdTime < currentMonth) {
      previousMonthCount += 1;
    }

    const monthLabel = parseMonthLabel(review.createdAt);
    monthCount.set(monthLabel, (monthCount.get(monthLabel) ?? 0) + 1);
  });

  const mostPopularService = (Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A") as
    | ReviewService
    | "N/A";

  const mostActiveMonth = Array.from(monthCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  const reviewGrowth = previousMonthCount === 0
    ? currentMonthCount * 100
    : Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100);

  const customerSatisfaction = approvedCount === 0
    ? 0
    : Math.round((recommendationCount / approvedCount) * 100);

  return {
    pendingReviews: pending,
    approvedReviews: approved,
    hiddenReviews: hidden,
    featuredReviews: featured,
    averageRating: approvedCount > 0 ? Math.round((ratingSum / approvedCount) * 10) / 10 : 0,
    reviewGrowth,
    mostPopularService,
    mostActiveMonth,
    customerSatisfaction,
  };
}

export async function listAdminReviews(
  status: "pending" | "approved" | "hidden" | "rejected" | "all",
  search: string | undefined,
  limit: number,
): Promise<AdminReviewListResponse> {
  const snapshot = await getAdminDb()
    .collection(REVIEWS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.max(limit, 200))
    .get();

  const allReviews = snapshot.docs.map((doc) => mapReviewDocument(doc.id, doc.data()));

  let filtered = [...allReviews];

  if (status !== "all") {
    filtered = filtered.filter((review) => review.status === status);
  }

  if (search) {
    const normalized = normalizeText(search);
    filtered = filtered.filter((review) => review.searchText.includes(normalized));
  }

  return {
    dashboard: buildDashboardMetrics(allReviews),
    reviews: filtered.slice(0, limit),
    total: filtered.length,
  };
}
