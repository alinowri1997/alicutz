import {ArrowLeft, ArrowRight, Clock3, FolderOpen, Search, Tag} from "lucide-react";

import {Link} from "@/i18n/navigation";
import {
  formatGuideDate,
  toCategoryLabel,
  type GuideListItem,
  type GuideSeriesDetails,
} from "@/lib/guides";
import type {AppLocale} from "@/i18n/routing";
import {BarbersAdviceNote} from "@/components/guides/barbers-advice-note";
import {QuickInfoCard} from "@/components/guides/quick-info-card";
import {ReadingProgressBar} from "@/components/guides/reading-progress-bar";
import {SeriesNavigation} from "@/components/guides/series-navigation";

interface GuidesListProps {
  locale: AppLocale;
  title: string;
  description: string;
  searchValue: string;
  selectedCategory?: string;
  categories: Array<{slug: string; count: number}>;
  items: GuideListItem[];
  totalItems: number;
  page: number;
  totalPages: number;
  basePath: string;
}

function buildPageHref(basePath: string, page: number, searchValue: string, category?: string): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (searchValue) {
    params.set("q", searchValue);
  }

  if (category) {
    params.set("category", category);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function GuidesListView({
  locale,
  title,
  description,
  searchValue,
  selectedCategory,
  categories,
  items,
  totalItems,
  page,
  totalPages,
  basePath,
}: GuidesListProps): React.JSX.Element {
  return (
    <main className="pb-24 pt-30 sm:pt-34">
      <section className="relative overflow-hidden border-b border-border/70 pb-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,var(--color-surface)_0%,transparent_60%)]" />
        <div className="container space-y-5">
          <p className="type-caption text-muted">Alicutz Journal</p>
          <h1 className="type-h1 max-w-[16ch] text-balance text-text">{title}</h1>
          <p className="type-body max-w-[70ch] text-muted">{description}</p>

          <form action="" method="get" className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="guides-search">Search guides</label>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="guides-search"
                name="q"
                defaultValue={searchValue}
                placeholder="Search topics"
                className="type-small w-full bg-transparent text-text placeholder:text-muted focus-visible:outline-none"
              />
            </div>
            <button type="submit" className="btn-base btn-accent type-caption h-12">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="container mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28 lg:h-fit">
          <p className="type-caption text-muted">Categories</p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/guides"
                locale={locale}
                className="type-small inline-flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-text"
              >
                <span>All Guides</span>
                <span>{totalItems}</span>
              </Link>
            </li>
            {categories.map((category) => {
              const active = selectedCategory === category.slug;

              return (
                <li key={category.slug}>
                  <Link
                    href={`/guides/category/${category.slug}`}
                    locale={locale}
                    className={[
                      "type-small inline-flex w-full items-center justify-between rounded-lg border px-3 py-2 transition-colors duration-200",
                      active
                        ? "border-accent bg-background text-text"
                        : "border-border text-muted hover:text-text",
                    ].join(" ")}
                  >
                    <span>{toCategoryLabel(category.slug)}</span>
                    <span>{category.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-5">
          {items.length === 0 ? (
            <article className="rounded-2xl border border-border bg-surface p-8">
              <h2 className="type-h4 text-text">No guides found</h2>
              <p className="type-small mt-2 text-muted">
                Try another keyword or browse the categories for premium grooming insights.
              </p>
            </article>
          ) : (
            items.map((guide) => (
              <article key={guide.slug} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex flex-wrap items-center gap-3 text-muted">
                  <span className="type-caption inline-flex items-center gap-1">
                    <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    {toCategoryLabel(guide.category)}
                  </span>
                  <span className="type-caption inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {guide.readingMinutes} min read
                  </span>
                </div>
                <h2 className="type-h3 mt-3 text-text">
                  <Link href={`/guides/${guide.slug}`} locale={locale} className="hover:text-accent">
                    {guide.title}
                  </Link>
                </h2>
                <p className="type-small mt-2 text-muted">{guide.excerpt}</p>
                <p className="type-caption mt-4 text-muted">Published {formatGuideDate(guide.publishedAt, locale)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span key={tag} className="type-caption inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}

          <div className="flex items-center justify-between gap-3 pt-4">
            <Link
              href={buildPageHref(basePath, Math.max(1, page - 1), searchValue, selectedCategory)}
              locale={locale}
              className={[
                "type-small inline-flex items-center gap-2 rounded-full border px-4 py-2",
                page <= 1 ? "pointer-events-none border-border text-muted opacity-50" : "border-border text-text",
              ].join(" ")}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Link>
            <p className="type-small text-muted">Page {page} of {totalPages}</p>
            <Link
              href={buildPageHref(basePath, Math.min(totalPages, page + 1), searchValue, selectedCategory)}
              locale={locale}
              className={[
                "type-small inline-flex items-center gap-2 rounded-full border px-4 py-2",
                page >= totalPages ? "pointer-events-none border-border text-muted opacity-50" : "border-border text-text",
              ].join(" ")}
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface GuideArticleProps {
  locale: AppLocale;
  guide: GuideListItem;
  content: React.ReactNode;
  continueReading: GuideListItem[];
  series: GuideSeriesDetails | null;
}

function GuideFaq({faq}: {faq: NonNullable<GuideListItem["faq"]>}): React.JSX.Element | null {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="guide-faq-heading" className="mt-16 rounded-2xl border border-border bg-surface p-6">
      <h2 id="guide-faq-heading" className="type-h4 text-text">Frequently asked questions</h2>
      <div className="mt-4 space-y-3">
        {faq.map((item) => (
          <details key={item.question} className="rounded-lg border border-border bg-background px-4 py-3">
            <summary className="type-small cursor-pointer text-text">{item.question}</summary>
            <p className="type-small mt-2 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function GuideArticleView({locale, guide, content, continueReading, series}: GuideArticleProps): React.JSX.Element {
  const updatedAt = guide.updatedAt ? formatGuideDate(guide.updatedAt, locale) : null;

  return (
    <main className="pb-24 pt-30 sm:pt-34">
      <ReadingProgressBar targetId="guide-article-body" />
      <article className="container grid gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <Link href="/guides" locale={locale} className="type-small inline-flex items-center gap-2 text-muted hover:text-text">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guides
          </Link>

          <header className="mt-6 rounded-2xl border border-border bg-surface p-7">
            <p className="type-caption text-muted">{toCategoryLabel(guide.category)}</p>
            <h1 className="type-h1 mt-2 max-w-[18ch] text-balance text-text">{guide.title}</h1>
            <p className="type-body mt-4 max-w-[64ch] text-muted">{guide.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-muted">
              <span className="type-caption">Published {formatGuideDate(guide.publishedAt, locale)}</span>
              {updatedAt ? <span className="type-caption">Updated {updatedAt}</span> : null}
              <span className="type-caption">{guide.readingMinutes} min read</span>
            </div>
          </header>

          {series ? <SeriesNavigation locale={locale} series={series} /> : null}

          <div id="guide-article-body" className="mt-10 max-w-[72ch]">{content}</div>

          {guide.barberAdvice ? <BarbersAdviceNote note={guide.barberAdvice} /> : null}

          <GuideFaq faq={guide.faq ?? []} />

          {continueReading.length > 0 ? (
            <section aria-labelledby="related-guides-heading" className="mt-16">
              <h2 id="related-guides-heading" className="type-h3 text-text">Continue Reading</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {continueReading.map((item) => (
                  <article key={item.slug} className="rounded-xl border border-border bg-surface p-4">
                    <p className="type-caption text-muted">{toCategoryLabel(item.category)}</p>
                    <h3 className="type-h5 mt-2 text-text">
                      <Link href={`/guides/${item.slug}`} locale={locale} className="hover:text-accent">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="type-small mt-2 text-muted">{item.excerpt}</p>
                    <p className="type-caption mt-3 text-muted">{item.readingMinutes} min read</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          <QuickInfoCard quickFacts={guide.quickFacts} />

          <aside className="rounded-2xl border border-border bg-surface p-5">
            <p className="type-caption text-muted">Table of contents</p>
            {guide.headings.length === 0 ? (
              <p className="type-small mt-2 text-muted">Headings appear here after publishing sections with ## markers.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {guide.headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`} className="type-small text-muted transition-colors hover:text-text">
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}
