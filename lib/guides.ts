import {promises as fs} from "node:fs";
import path from "node:path";
import {cache} from "react";

import matter from "gray-matter";
import readingTime from "reading-time";

import {defaultLocale, locales, type AppLocale} from "@/i18n/routing";
import {
  buildGuideBlueprintAuditSummary,
  buildGuideSeoBlueprint,
  createGuideEditorialChecklist,
  normalizeGuideSeoBlueprintInput,
  type GuideEditorialChecklist,
  type GuideSeoBlueprint,
  type GuideSeoBlueprintInput,
} from "@/lib/guides-blueprint";

const GUIDES_ROOT = path.join(process.cwd(), "content", "guides");
const PAGE_SIZE = 9;

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface GuideQuickFacts {
  appointmentDuration?: string;
  languages?: string[];
  bestFor?: string;
  location?: string;
  appointmentRequired?: string;
}

export interface GuideSeriesReference {
  title: string;
  slug: string;
  order: number;
}

export interface GuideFrontmatter {
  title: string;
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  faq?: GuideFaqItem[];
  quickFacts?: GuideQuickFacts;
  barberAdvice?: string;
  related?: string[];
  searchIntent?: string[];
  audience?: string[];
  series?: GuideSeriesReference;
  seoBlueprint?: GuideSeoBlueprintInput;
}

export interface GuideListItem extends GuideFrontmatter {
  slug: string;
  locale: AppLocale;
  readingMinutes: number;
  headings: Array<{id: string; text: string}>;
  seoBlueprint: GuideSeoBlueprint;
  editorialChecklist: GuideEditorialChecklist;
}

export interface GuidesQuery {
  locale: AppLocale;
  page?: number;
  category?: string;
  search?: string;
  limit?: number;
}

export interface GuidesQueryResult {
  items: GuideListItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GuideSource {
  filePath: string;
  locale: AppLocale;
}

export interface GuideSeriesDetails {
  title: string;
  slug: string;
  items: GuideListItem[];
  total: number;
  currentIndex: number;
  previous: GuideListItem | null;
  next: GuideListItem | null;
  progressPercent: number;
}

function normalizeTokenList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map((value) => String(value).trim().toLowerCase()).filter(Boolean))];
}

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseHeadings(source: string): Array<{id: string; text: string}> {
  const matches = source.matchAll(/^##\s+(.+)$/gm);
  const headings: Array<{id: string; text: string}> = [];

  for (const match of matches) {
    const text = match[1]?.trim();

    if (!text) {
      continue;
    }

    headings.push({
      text,
      id: slugifySegment(text),
    });
  }

  return headings;
}

function normalizeQuickFacts(quickFacts: unknown): GuideQuickFacts | undefined {
  if (!quickFacts || typeof quickFacts !== "object") {
    return undefined;
  }

  const raw = quickFacts as Record<string, unknown>;
  const appointmentDuration =
    typeof raw.appointmentDuration === "string"
      ? raw.appointmentDuration.trim()
      : typeof raw.idealDuration === "string"
        ? raw.idealDuration.trim()
        : "";

  const bestFor = typeof raw.bestFor === "string" ? raw.bestFor.trim() : "";
  const location = typeof raw.location === "string" ? raw.location.trim() : "";
  const languages = Array.isArray(raw.languages)
    ? raw.languages.map((value) => String(value).trim()).filter(Boolean)
    : [];

  const appointmentRequired =
    typeof raw.appointmentRequired === "string"
      ? raw.appointmentRequired.trim()
      : typeof raw.appointmentRequired === "boolean"
        ? raw.appointmentRequired
          ? "Required"
          : "Optional"
        : "";

  const result: GuideQuickFacts = {};

  if (appointmentDuration) {
    result.appointmentDuration = appointmentDuration;
  }

  if (languages.length > 0) {
    result.languages = languages;
  }

  if (bestFor) {
    result.bestFor = bestFor;
  }

  if (location) {
    result.location = location;
  }

  if (appointmentRequired) {
    result.appointmentRequired = appointmentRequired;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function normalizeSeries(series: unknown): GuideSeriesReference | undefined {
  if (!series || typeof series !== "object") {
    return undefined;
  }

  const raw = series as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const parsedOrder = Number(raw.order);
  const order = Number.isFinite(parsedOrder) && parsedOrder > 0 ? Math.floor(parsedOrder) : 0;

  if (!title || order === 0) {
    return undefined;
  }

  const slug =
    typeof raw.slug === "string" && raw.slug.trim()
      ? slugifySegment(raw.slug)
      : slugifySegment(title);

  return {
    title,
    slug,
    order,
  };
}

function normalizeFrontmatter(frontmatter: Partial<GuideFrontmatter>): GuideFrontmatter {
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  return {
    title: String(frontmatter.title ?? "").trim(),
    description: String(frontmatter.description ?? "").trim(),
    excerpt: String(frontmatter.excerpt ?? "").trim(),
    category: slugifySegment(String(frontmatter.category ?? "general")),
    tags,
    publishedAt: String(frontmatter.publishedAt ?? "").trim(),
    updatedAt: frontmatter.updatedAt ? String(frontmatter.updatedAt).trim() : undefined,
    faq: Array.isArray(frontmatter.faq)
      ? frontmatter.faq
          .map((item) => ({
            question: String(item?.question ?? "").trim(),
            answer: String(item?.answer ?? "").trim(),
          }))
          .filter((item) => item.question && item.answer)
      : [],
    quickFacts: normalizeQuickFacts(frontmatter.quickFacts),
    barberAdvice: frontmatter.barberAdvice ? String(frontmatter.barberAdvice).trim() : undefined,
    related: Array.isArray(frontmatter.related)
      ? frontmatter.related.map((slug) => slugifySegment(String(slug))).filter(Boolean)
      : [],
    searchIntent: normalizeTokenList(frontmatter.searchIntent),
    audience: normalizeTokenList(frontmatter.audience),
    series: normalizeSeries(frontmatter.series),
    seoBlueprint: normalizeGuideSeoBlueprintInput(frontmatter.seoBlueprint),
  };
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function listLocaleFiles(locale: AppLocale): Promise<string[]> {
  const localeDir = path.join(GUIDES_ROOT, locale);

  if (!(await directoryExists(localeDir))) {
    return [];
  }

  const entries = await fs.readdir(localeDir, {withFileTypes: true});

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""));
}

async function resolveGuideSource(locale: AppLocale, slug: string): Promise<GuideSource | null> {
  const fallbackLocales: AppLocale[] = [locale, defaultLocale, "en"];

  for (const candidateLocale of fallbackLocales) {
    const filePath = path.join(GUIDES_ROOT, candidateLocale, `${slug}.mdx`);

    try {
      await fs.access(filePath);
      return {filePath, locale: candidateLocale};
    } catch {
      continue;
    }
  }

  return null;
}

export const getAllGuideSlugs = cache(async (): Promise<string[]> => {
  const slugSet = new Set<string>();

  await Promise.all(
    locales.map(async (locale) => {
      const files = await listLocaleFiles(locale);
      files.forEach((slug) => slugSet.add(slug));
    }),
  );

  return [...slugSet].sort();
});

const getAllGuides = cache(async (locale: AppLocale): Promise<GuideListItem[]> => {
  const slugs = await getAllGuideSlugs();

  const guides = (
    await Promise.all(
      slugs.map(async (slug) => {
        const guide = await getGuideBySlug(locale, slug);
        return guide?.item ?? null;
      }),
    )
  ).filter((item): item is GuideListItem => item !== null);

  return guides.sort((a, b) => {
    const aDate = Date.parse(a.publishedAt) || 0;
    const bDate = Date.parse(b.publishedAt) || 0;
    return bDate - aDate;
  });
});

export const getGuideBySlug = cache(async (locale: AppLocale, slug: string): Promise<{item: GuideListItem; source: string} | null> => {
  const normalizedSlug = slugifySegment(slug);
  const guideSource = await resolveGuideSource(locale, normalizedSlug);

  if (!guideSource) {
    return null;
  }

  const raw = await fs.readFile(guideSource.filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = normalizeFrontmatter(parsed.data as Partial<GuideFrontmatter>);

  let mergedFrontmatter = frontmatter;

  if (guideSource.locale !== "en") {
    const englishSource = await resolveGuideSource("en", normalizedSlug);

    if (englishSource) {
      const englishRaw = await fs.readFile(englishSource.filePath, "utf8");
      const englishParsed = matter(englishRaw);
      const englishFrontmatter = normalizeFrontmatter(englishParsed.data as Partial<GuideFrontmatter>);

      mergedFrontmatter = {
        ...englishFrontmatter,
        ...frontmatter,
        title: frontmatter.title || englishFrontmatter.title,
        description: frontmatter.description || englishFrontmatter.description,
        excerpt: frontmatter.excerpt || englishFrontmatter.excerpt,
        tags: frontmatter.tags.length > 0 ? frontmatter.tags : englishFrontmatter.tags,
        faq: frontmatter.faq && frontmatter.faq.length > 0 ? frontmatter.faq : englishFrontmatter.faq,
        quickFacts: frontmatter.quickFacts ?? englishFrontmatter.quickFacts,
        barberAdvice: frontmatter.barberAdvice ?? englishFrontmatter.barberAdvice,
        related: frontmatter.related && frontmatter.related.length > 0 ? frontmatter.related : englishFrontmatter.related,
        searchIntent:
          frontmatter.searchIntent && frontmatter.searchIntent.length > 0
            ? frontmatter.searchIntent
            : englishFrontmatter.searchIntent,
        audience:
          frontmatter.audience && frontmatter.audience.length > 0
            ? frontmatter.audience
            : englishFrontmatter.audience,
        series: frontmatter.series ?? englishFrontmatter.series,
        seoBlueprint: frontmatter.seoBlueprint ?? englishFrontmatter.seoBlueprint,
      };
    }
  }

  if (!mergedFrontmatter.title || !mergedFrontmatter.description || !mergedFrontmatter.publishedAt) {
    return null;
  }

  const reading = readingTime(parsed.content);
  const headings = parseHeadings(parsed.content);
  const readingMinutes = Math.max(1, Math.ceil(reading.minutes));
  const seoBlueprint = buildGuideSeoBlueprint({
    locale: guideSource.locale,
    slug: normalizedSlug,
    title: mergedFrontmatter.title,
    description: mergedFrontmatter.description,
    excerpt: mergedFrontmatter.excerpt,
    category: mergedFrontmatter.category,
    tags: mergedFrontmatter.tags,
    searchIntentTokens: mergedFrontmatter.searchIntent,
    audienceTokens: mergedFrontmatter.audience,
    relatedSlugs: mergedFrontmatter.related,
    faqQuestions: (mergedFrontmatter.faq ?? []).map((item) => item.question),
    readingMinutes,
    series: mergedFrontmatter.series
      ? {
          title: mergedFrontmatter.series.title,
          slug: mergedFrontmatter.series.slug,
        }
      : undefined,
    input: mergedFrontmatter.seoBlueprint,
  });
  const editorialChecklist = createGuideEditorialChecklist(seoBlueprint);

  return {
    item: {
      ...mergedFrontmatter,
      slug: normalizedSlug,
      locale: guideSource.locale,
      readingMinutes,
      headings,
      seoBlueprint,
      editorialChecklist,
    },
    source: parsed.content,
  };
});

export const getGuides = cache(async ({
  locale,
  page = 1,
  category,
  search,
  limit = PAGE_SIZE,
}: GuidesQuery): Promise<GuidesQueryResult> => {
  const guides = await getAllGuides(locale);

  const normalizedCategory = category ? slugifySegment(category) : undefined;
  const normalizedSearch = search?.trim().toLowerCase();

  const filtered = guides
    .filter((item) => {
      if (normalizedCategory && item.category !== normalizedCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchArea = `${item.title} ${item.description} ${item.excerpt} ${item.tags.join(" ")}`.toLowerCase();
      return searchArea.includes(normalizedSearch);
    })
    .sort((a, b) => {
      const aDate = Date.parse(a.publishedAt) || 0;
      const bDate = Date.parse(b.publishedAt) || 0;
      return bDate - aDate;
    });

  const safeLimit = Math.max(1, limit);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit;

  return {
    items: filtered.slice(start, end),
    page: safePage,
    totalPages,
    totalItems,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
});

export const getGuideCategories = cache(async (locale: AppLocale): Promise<Array<{slug: string; count: number}>> => {
  const guides = await getAllGuides(locale);
  const categoryMap = new Map<string, number>();

  guides.forEach((item) => {
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1);
  });

  return [...categoryMap.entries()]
    .map(([slug, count]) => ({slug, count}))
    .sort((a, b) => a.slug.localeCompare(b.slug));
});

function overlapCount(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const bSet = new Set(b);
  return a.reduce((count, entry) => (bSet.has(entry) ? count + 1 : count), 0);
}

export async function getContinueReadingGuides(locale: AppLocale, guide: GuideListItem, limit = 3): Promise<GuideListItem[]> {
  const all = await getAllGuides(locale);
  const relatedBySlug = new Set(guide.related ?? []);

  const scored = all
    .filter((item) => item.slug !== guide.slug)
    .map((item) => {
      const intentOverlap = overlapCount(item.searchIntent ?? [], guide.searchIntent ?? []);
      const audienceOverlap = overlapCount(item.audience ?? [], guide.audience ?? []);
      const tagOverlap = overlapCount(
        item.tags.map((tag) => tag.toLowerCase()),
        guide.tags.map((tag) => tag.toLowerCase()),
      );
      const sameCategory = item.category === guide.category ? 1 : 0;
      const explicitlyRelated = relatedBySlug.has(item.slug) ? 1 : 0;

      const score =
        explicitlyRelated * 120 +
        intentOverlap * 60 +
        audienceOverlap * 35 +
        sameCategory * 30 +
        tagOverlap * 10;

      return {item, score};
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aDate = Date.parse(a.item.publishedAt) || 0;
      const bDate = Date.parse(b.item.publishedAt) || 0;
      return bDate - aDate;
    });

  return scored.slice(0, Math.max(1, limit)).map((entry) => entry.item);
}

export async function getGuideSeries(locale: AppLocale, guide: GuideListItem): Promise<GuideSeriesDetails | null> {
  if (!guide.series) {
    return null;
  }

  const all = await getAllGuides(locale);
  const seriesItems = all
    .filter((item) => item.series?.slug === guide.series?.slug)
    .sort((a, b) => {
      const aOrder = a.series?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.series?.order ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (Date.parse(a.publishedAt) || 0) - (Date.parse(b.publishedAt) || 0);
    });

  if (seriesItems.length === 0) {
    return null;
  }

  const currentIndex = seriesItems.findIndex((item) => item.slug === guide.slug);

  if (currentIndex < 0) {
    return null;
  }

  return {
    title: guide.series.title,
    slug: guide.series.slug,
    items: seriesItems,
    total: seriesItems.length,
    currentIndex,
    previous: seriesItems[currentIndex - 1] ?? null,
    next: seriesItems[currentIndex + 1] ?? null,
    progressPercent: Math.round(((currentIndex + 1) / seriesItems.length) * 100),
  };
}

export async function getSeriesBySlug(locale: AppLocale, seriesSlug: string): Promise<GuideSeriesDetails | null> {
  const all = await getAllGuides(locale);
  const normalized = slugifySegment(seriesSlug);
  const seriesItems = all
    .filter((item) => item.series?.slug === normalized)
    .sort((a, b) => {
      const aOrder = a.series?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.series?.order ?? Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (Date.parse(a.publishedAt) || 0) - (Date.parse(b.publishedAt) || 0);
    });

  if (seriesItems.length === 0) {
    return null;
  }

  return {
    title: seriesItems[0].series?.title ?? toCategoryLabel(normalized),
    slug: normalized,
    items: seriesItems,
    total: seriesItems.length,
    currentIndex: -1,
    previous: null,
    next: null,
    progressPercent: 0,
  };
}

export const getAllGuideSeriesSlugs = cache(async (): Promise<string[]> => {
  const slugSet = new Set<string>();

  for (const locale of locales) {
    const guides = await getAllGuides(locale);

    guides.forEach((item) => {
      if (item.series?.slug) {
        slugSet.add(item.series.slug);
      }
    });
  }

  return [...slugSet].sort();
});

export interface GuideBlueprintAuditItem {
  slug: string;
  locale: AppLocale;
  checklist: GuideEditorialChecklist;
  category: string;
  series?: string;
}

export async function getGuideBlueprintAudit(locale: AppLocale): Promise<{
  items: GuideBlueprintAuditItem[];
  summary: ReturnType<typeof buildGuideBlueprintAuditSummary>;
}> {
  const guides = await getAllGuides(locale);
  const items = guides.map((guide) => ({
    slug: guide.slug,
    locale: guide.locale,
    checklist: guide.editorialChecklist,
    category: guide.seoBlueprint.category,
    series: guide.seoBlueprint.series?.slug,
  }));

  return {
    items,
    summary: buildGuideBlueprintAuditSummary(items.map((item) => item.checklist)),
  };
}

export async function getGuideBlueprintAuditAllLocales(): Promise<Record<AppLocale, Awaited<ReturnType<typeof getGuideBlueprintAudit>>>> {
  const results = await Promise.all(
    locales.map(async (locale) => {
      const audit = await getGuideBlueprintAudit(locale);
      return [locale, audit] as const;
    }),
  );

  return Object.fromEntries(results) as Record<AppLocale, Awaited<ReturnType<typeof getGuideBlueprintAudit>>>;
}

export function formatGuideDate(date: string, locale: AppLocale): string {
  const parsed = Date.parse(date);

  if (Number.isNaN(parsed)) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(parsed));
}

export function toCategoryLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
