import {z} from "zod";

import type {AppLocale} from "@/i18n/routing";
import {SITE_URL} from "@/lib/seo";

export const GUIDE_SEARCH_INTENTS = [
  "informational",
  "commercial",
  "transactional",
  "navigational",
] as const;

export const GUIDE_TARGET_AUDIENCES = [
  "tourists",
  "business-travelers",
  "locals",
  "students",
  "luxury-clients",
] as const;

export const GUIDE_BLUEPRINT_CATEGORIES = [
  "tourist-guides",
  "modern-haircuts",
  "classic-haircuts",
  "hotel-services",
  "languages",
  "mens-grooming",
] as const;

export const GUIDE_DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;

export const GUIDE_CTA_TYPES = [
  "whatsapp-consultation",
  "book-via-whatsapp",
  "message-on-whatsapp",
] as const;

export const GUIDE_JSON_LD_TYPES = [
  "Article",
  "FAQPage",
  "BreadcrumbList",
  "HowTo",
  "ItemList",
  "Service",
] as const;

export type GuideSearchIntent = (typeof GUIDE_SEARCH_INTENTS)[number];
export type GuideTargetAudience = (typeof GUIDE_TARGET_AUDIENCES)[number];
export type GuideBlueprintCategory = (typeof GUIDE_BLUEPRINT_CATEGORIES)[number];
export type GuideDifficulty = (typeof GUIDE_DIFFICULTY_LEVELS)[number];
export type GuideCtaType = (typeof GUIDE_CTA_TYPES)[number];
export type GuideJsonLdType = (typeof GUIDE_JSON_LD_TYPES)[number];

export interface GuideInternalLinkSuggestion {
  slug: string;
  anchor: string;
  reason: string;
}

export interface GuideSeriesBlueprint {
  title: string;
  slug: string;
}

export interface GuideSeoBlueprint {
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticKeywords: string[];
  searchIntent: GuideSearchIntent;
  targetAudience: GuideTargetAudience[];
  countryTarget: string[];
  languageTarget: string[];
  category: GuideBlueprintCategory;
  series?: GuideSeriesBlueprint;
  difficulty: GuideDifficulty;
  estimatedReadingTime: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  internalLinkingSuggestions: GuideInternalLinkSuggestion[];
  ctaType: GuideCtaType;
  faqIdeas: string[];
  jsonLdSupport: GuideJsonLdType[];
}

export interface GuideEditorialChecklist {
  seoComplete: boolean;
  internalLinksComplete: boolean;
  faqComplete: boolean;
  schemaComplete: boolean;
  readingTimeComplete: boolean;
  seriesComplete: boolean;
  categoryComplete: boolean;
  metaTagsComplete: boolean;
  slugComplete: boolean;
  readyToPublish: boolean;
  missingItems: string[];
}

const internalLinkSuggestionSchema = z.object({
  slug: z.string().trim().min(1),
  anchor: z.string().trim().min(2).max(120),
  reason: z.string().trim().min(3).max(220),
});

export const guideSeoBlueprintInputSchema = z.object({
  primaryKeyword: z.string().trim().min(2).max(120).optional(),
  secondaryKeywords: z.array(z.string().trim().min(2).max(120)).max(20).optional(),
  semanticKeywords: z.array(z.string().trim().min(2).max(120)).max(30).optional(),
  searchIntent: z.enum(GUIDE_SEARCH_INTENTS).optional(),
  targetAudience: z.array(z.enum(GUIDE_TARGET_AUDIENCES)).max(10).optional(),
  countryTarget: z.array(z.string().trim().min(2).max(60)).max(10).optional(),
  languageTarget: z.array(z.string().trim().min(2).max(60)).max(10).optional(),
  category: z.enum(GUIDE_BLUEPRINT_CATEGORIES).optional(),
  series: z
    .object({
      title: z.string().trim().min(2).max(120),
      slug: z.string().trim().min(2).max(120),
    })
    .optional(),
  difficulty: z.enum(GUIDE_DIFFICULTY_LEVELS).optional(),
  estimatedReadingTime: z.string().trim().min(3).max(30).optional(),
  slug: z.string().trim().min(2).max(200).optional(),
  metaTitle: z.string().trim().min(10).max(65).optional(),
  metaDescription: z.string().trim().min(70).max(170).optional(),
  canonicalUrl: z.string().trim().url().optional(),
  internalLinkingSuggestions: z.array(internalLinkSuggestionSchema).max(24).optional(),
  ctaType: z.enum(GUIDE_CTA_TYPES).optional(),
  faqIdeas: z.array(z.string().trim().min(5).max(180)).max(20).optional(),
  jsonLdSupport: z.array(z.enum(GUIDE_JSON_LD_TYPES)).min(1).max(8).optional(),
});

export type GuideSeoBlueprintInput = z.input<typeof guideSeoBlueprintInputSchema>;

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function capMetaDescription(value: string): string {
  if (value.length <= 160) {
    return value;
  }

  return `${value.slice(0, 157).trim()}...`;
}

function mapLegacyCategoryToBlueprint(categorySlug: string): GuideBlueprintCategory {
  const slug = slugifySegment(categorySlug);

  if (slug.includes("hotel")) {
    return "hotel-services";
  }

  if (slug.includes("tourist") || slug.includes("travel") || slug.includes("private")) {
    return "tourist-guides";
  }

  if (slug.includes("classic")) {
    return "classic-haircuts";
  }

  if (slug.includes("modern") || slug.includes("fade")) {
    return "modern-haircuts";
  }

  if (slug.includes("language")) {
    return "languages";
  }

  return "mens-grooming";
}

function mapIntentFromTokens(values: string[]): GuideSearchIntent {
  const normalized = values.map((value) => slugifySegment(value));

  if (normalized.some((value) => value.includes("book") || value.includes("appointment") || value.includes("reserve"))) {
    return "transactional";
  }

  if (normalized.some((value) => value.includes("best") || value.includes("vs") || value.includes("compare") || value.includes("price"))) {
    return "commercial";
  }

  if (normalized.some((value) => value.includes("near") || value.includes("alicutz") || value.includes("location"))) {
    return "navigational";
  }

  return "informational";
}

function mapAudienceFromTokens(values: string[]): GuideTargetAudience[] {
  const normalized = values.map((value) => slugifySegment(value));
  const mapped = new Set<GuideTargetAudience>();

  normalized.forEach((token) => {
    if (token.includes("tourist") || token.includes("visitor") || token.includes("hotel-guest")) {
      mapped.add("tourists");
    }

    if (token.includes("business") || token.includes("executive") || token.includes("conference")) {
      mapped.add("business-travelers");
    }

    if (token.includes("local") || token.includes("resident")) {
      mapped.add("locals");
    }

    if (token.includes("student")) {
      mapped.add("students");
    }

    if (token.includes("luxury") || token.includes("premium")) {
      mapped.add("luxury-clients");
    }
  });

  return mapped.size > 0 ? [...mapped] : ["tourists"];
}

export function normalizeGuideSeoBlueprintInput(value: unknown): GuideSeoBlueprintInput | undefined {
  const parsed = guideSeoBlueprintInputSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

interface BuildGuideSeoBlueprintParams {
  locale: AppLocale;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  searchIntentTokens?: string[];
  audienceTokens?: string[];
  relatedSlugs?: string[];
  faqQuestions?: string[];
  readingMinutes: number;
  series?: {title: string; slug: string};
  input?: GuideSeoBlueprintInput;
}

export function buildGuideSeoBlueprint(params: BuildGuideSeoBlueprintParams): GuideSeoBlueprint {
  const {
    locale,
    slug,
    title,
    description,
    excerpt,
    category,
    tags,
    searchIntentTokens = [],
    audienceTokens = [],
    relatedSlugs = [],
    faqQuestions = [],
    readingMinutes,
    series,
    input,
  } = params;

  const normalizedInput = normalizeGuideSeoBlueprintInput(input);
  const canonicalSlug = slugifySegment(normalizedInput?.slug ?? slug);

  const primaryKeyword =
    normalizedInput?.primaryKeyword ??
    uniqueStrings(tags)[0] ??
    title;

  const secondaryKeywords =
    normalizedInput?.secondaryKeywords && normalizedInput.secondaryKeywords.length > 0
      ? uniqueStrings(normalizedInput.secondaryKeywords)
      : uniqueStrings(tags.slice(1, 6));

  const semanticKeywords =
    normalizedInput?.semanticKeywords && normalizedInput.semanticKeywords.length > 0
      ? uniqueStrings(normalizedInput.semanticKeywords)
      : uniqueStrings([...tags, ...secondaryKeywords, ...title.split(" "), ...category.split("-")]).slice(0, 16);

  const searchIntent =
    normalizedInput?.searchIntent ?? mapIntentFromTokens(searchIntentTokens.length > 0 ? searchIntentTokens : tags);

  const targetAudience =
    normalizedInput?.targetAudience && normalizedInput.targetAudience.length > 0
      ? normalizedInput.targetAudience
      : mapAudienceFromTokens(audienceTokens);

  const countryTarget =
    normalizedInput?.countryTarget && normalizedInput.countryTarget.length > 0
      ? uniqueStrings(normalizedInput.countryTarget)
      : ["Turkey"];

  const languageTarget =
    normalizedInput?.languageTarget && normalizedInput.languageTarget.length > 0
      ? uniqueStrings(normalizedInput.languageTarget)
      : [locale];

  const blueprintCategory = normalizedInput?.category ?? mapLegacyCategoryToBlueprint(category);

  const blueprintSeries = normalizedInput?.series
    ? {
        title: normalizedInput.series.title,
        slug: slugifySegment(normalizedInput.series.slug),
      }
    : series
      ? {
          title: series.title,
          slug: slugifySegment(series.slug),
        }
      : undefined;

  const estimatedReadingTime = normalizedInput?.estimatedReadingTime ?? `${Math.max(1, readingMinutes)} min read`;
  const metaTitle = normalizedInput?.metaTitle ?? `${title} | Ali Cutz Guides`;
  const metaDescription = normalizedInput?.metaDescription ?? capMetaDescription(description || excerpt);
  const canonicalUrl = normalizedInput?.canonicalUrl ?? `${SITE_URL}/${locale}/guides/${canonicalSlug}`;

  const internalLinkingSuggestions =
    normalizedInput?.internalLinkingSuggestions && normalizedInput.internalLinkingSuggestions.length > 0
      ? normalizedInput.internalLinkingSuggestions.map((entry) => ({
          slug: slugifySegment(entry.slug),
          anchor: entry.anchor,
          reason: entry.reason,
        }))
      : relatedSlugs.slice(0, 8).map((relatedSlug) => ({
          slug: slugifySegment(relatedSlug),
          anchor: `Related: ${relatedSlug.replace(/-/g, " ")}`,
          reason: "Supports topical depth and session continuity.",
        }));

  const faqIdeas =
    normalizedInput?.faqIdeas && normalizedInput.faqIdeas.length > 0
      ? uniqueStrings(normalizedInput.faqIdeas)
      : uniqueStrings(faqQuestions).slice(0, 10);

  const jsonLdSupport: GuideJsonLdType[] =
    normalizedInput?.jsonLdSupport && normalizedInput.jsonLdSupport.length > 0
      ? [...new Set(normalizedInput.jsonLdSupport)]
      : faqIdeas.length > 0
        ? ["Article", "BreadcrumbList", "FAQPage"]
        : ["Article", "BreadcrumbList"];

  return {
    primaryKeyword,
    secondaryKeywords,
    semanticKeywords,
    searchIntent,
    targetAudience,
    countryTarget,
    languageTarget,
    category: blueprintCategory,
    series: blueprintSeries,
    difficulty: normalizedInput?.difficulty ?? "medium",
    estimatedReadingTime,
    slug: canonicalSlug,
    metaTitle,
    metaDescription,
    canonicalUrl,
    internalLinkingSuggestions,
    ctaType: normalizedInput?.ctaType ?? "whatsapp-consultation",
    faqIdeas,
    jsonLdSupport,
  };
}

export function createGuideEditorialChecklist(blueprint: GuideSeoBlueprint): GuideEditorialChecklist {
  const seoComplete = Boolean(
    blueprint.primaryKeyword &&
      blueprint.metaTitle &&
      blueprint.metaDescription &&
      blueprint.canonicalUrl,
  );

  const internalLinksComplete = blueprint.internalLinkingSuggestions.length > 0;
  const faqComplete = blueprint.faqIdeas.length > 0;
  const schemaComplete = blueprint.jsonLdSupport.includes("Article") && blueprint.jsonLdSupport.includes("BreadcrumbList");
  const readingTimeComplete = Boolean(blueprint.estimatedReadingTime);
  const seriesComplete = Boolean(blueprint.series?.title && blueprint.series?.slug);
  const categoryComplete = Boolean(blueprint.category);
  const metaTagsComplete = Boolean(blueprint.metaTitle && blueprint.metaDescription);
  const slugComplete = Boolean(blueprint.slug);

  const missingItems: string[] = [];

  if (!seoComplete) {
    missingItems.push("SEO complete");
  }

  if (!internalLinksComplete) {
    missingItems.push("Internal links complete");
  }

  if (!faqComplete) {
    missingItems.push("FAQ complete");
  }

  if (!schemaComplete) {
    missingItems.push("Schema complete");
  }

  if (!readingTimeComplete) {
    missingItems.push("Reading time");
  }

  if (!seriesComplete) {
    missingItems.push("Series");
  }

  if (!categoryComplete) {
    missingItems.push("Category");
  }

  if (!metaTagsComplete) {
    missingItems.push("Meta tags");
  }

  if (!slugComplete) {
    missingItems.push("Slug");
  }

  return {
    seoComplete,
    internalLinksComplete,
    faqComplete,
    schemaComplete,
    readingTimeComplete,
    seriesComplete,
    categoryComplete,
    metaTagsComplete,
    slugComplete,
    readyToPublish: missingItems.length === 0,
    missingItems,
  };
}

export function buildGuideBlueprintAuditSummary(checklists: GuideEditorialChecklist[]): {
  total: number;
  ready: number;
  notReady: number;
  readinessRate: number;
} {
  const total = checklists.length;
  const ready = checklists.filter((entry) => entry.readyToPublish).length;
  const notReady = Math.max(0, total - ready);
  const readinessRate = total === 0 ? 100 : Math.round((ready / total) * 100);

  return {
    total,
    ready,
    notReady,
    readinessRate,
  };
}
