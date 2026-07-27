import {z} from "zod";

const services = ["Haircut", "Fade", "Color", "Beard", "Home Service", "Other"] as const;

const reviewTags = [
  "Haircut",
  "Fade",
  "Beard",
  "Color",
  "Friendly",
  "Fast Service",
  "Home Service",
  "Professional",
  "Clean Environment",
] as const;

const sorts = [
  "newest",
  "oldest",
  "highestRating",
  "lowestRating",
  "mostHelpful",
  "mostLiked",
] as const;

const booleanFromQuery = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return undefined;
}, z.boolean().optional());

export const reviewRatingSchema = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  languageCode: z.string().trim().min(2).max(12),
  language: z.string().trim().min(2).max(32),
  service: z.enum(services),
  rating: reviewRatingSchema,
  review: z.string().trim().min(20).max(2000),
  visitDate: z.string().trim().optional(),
  tags: z.array(z.enum(reviewTags)).max(9).default([]),
});

export const updateReviewSchema = z.object({
  customerName: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  languageCode: z.string().trim().min(2).max(12).optional(),
  language: z.string().trim().min(2).max(32).optional(),
  service: z.enum(services).optional(),
  rating: reviewRatingSchema.optional(),
  review: z.string().trim().min(20).max(2000).optional(),
  visitDate: z.string().trim().optional(),
  tags: z.array(z.enum(reviewTags)).max(9).optional(),
  reply: z
    .object({
      authorName: z.string().trim().min(1).max(80),
      authorRole: z.string().trim().min(1).max(80),
      message: z.string().trim().min(1).max(1000),
      replyDate: z.string().trim().min(1).max(64),
    })
    .nullable()
    .optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  approved: z.boolean().optional(),
  hidden: z.boolean().optional(),
  status: z.enum(["pending", "approved", "hidden", "rejected"]).optional(),
});

export const reviewReplySchema = z.object({
  message: z.string().trim().min(3).max(1000),
});

export const reportReviewSchema = z.object({
  reason: z.string().trim().min(2).max(120),
  details: z.string().trim().max(500).optional(),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(8),
  search: z.string().trim().max(120).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verified: booleanFromQuery,
  withPhotos: booleanFromQuery,
  featured: booleanFromQuery,
  service: z.enum(services).optional(),
  sort: z.enum(sorts).default("newest"),
});

export const adminReviewQuerySchema = z.object({
  status: z.enum(["pending", "approved", "hidden", "rejected", "all"]).default("all"),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const reviewModerationActionSchema = z.object({
  action: z.enum(["approve", "reject", "delete", "hide", "pin", "verify", "edit", "reply", "deletePhoto"]),
  payload: z.record(z.string(), z.unknown()).optional(),
});
