import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {defaultLocale, locales, routing, type AppLocale} from "@/i18n/routing";
import {formatGuideDate, getAllGuideSeriesSlugs, getSeriesBySlug} from "@/lib/guides";
import {buildLanguageAlternates, localeToLanguageTag, SITE_URL} from "@/lib/seo";

interface GuidesSeriesPageProps {
  params: Promise<{locale: string; series: string}>;
}

export async function generateStaticParams(): Promise<Array<{locale: AppLocale; series: string}>> {
  const seriesSlugs = await getAllGuideSeriesSlugs();

  return locales.flatMap((locale) => seriesSlugs.map((series) => ({locale, series})));
}

export async function generateMetadata({params}: GuidesSeriesPageProps): Promise<Metadata> {
  const {locale: rawLocale, series: seriesSlug} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const series = await getSeriesBySlug(locale, seriesSlug);

  if (!series) {
    return {
      title: "Series Not Found | Ali Cutz",
      description: "This guide series is not available.",
    };
  }

  return {
    title: `${series.title} Series | Ali Cutz Guides`,
    description: `${series.total} connected guide articles in the ${series.title} series.`,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides/series/${series.slug}`,
      languages: buildLanguageAlternates(`/guides/series/${series.slug}`),
    },
    openGraph: {
      title: `${series.title} Series | Ali Cutz Guides`,
      description: `${series.total} connected guide articles in the ${series.title} series.`,
      url: `${SITE_URL}/${locale}/guides/series/${series.slug}`,
      type: "website",
      locale: localeToLanguageTag[locale],
      alternateLocale: locales.filter((entry) => entry !== locale).map((entry) => localeToLanguageTag[entry]),
    },
  };
}

export default async function GuidesSeriesPage({params}: GuidesSeriesPageProps): Promise<React.JSX.Element> {
  const {locale: rawLocale, series: seriesSlug} = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const series = await getSeriesBySlug(locale, seriesSlug);

  if (!series) {
    notFound();
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/${locale}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: series.title,
        item: `${SITE_URL}/${locale}/guides/series/${series.slug}`,
      },
    ],
  };

  return (
    <main className="pb-24 pt-30 sm:pt-34">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />

      <section className="container max-w-4xl space-y-6">
        <Link href="/guides" locale={locale} className="type-small text-muted hover:text-text">
          Back to guides
        </Link>

        <header className="rounded-2xl border border-border bg-surface p-7">
          <p className="type-caption text-muted">Guide Series</p>
          <h1 className="type-h1 mt-2 text-text">{series.title}</h1>
          <p className="type-body mt-3 text-muted">{series.total} connected articles designed to be read in sequence.</p>
        </header>

        <ol className="space-y-4">
          {series.items.map((item, index) => (
            <li key={item.slug} className="rounded-xl border border-border bg-surface p-5">
              <p className="type-caption text-muted">Article {index + 1} of {series.total}</p>
              <h2 className="type-h4 mt-2 text-text">
                <Link href={`/guides/${item.slug}`} locale={locale} className="hover:text-accent">
                  {item.title}
                </Link>
              </h2>
              <p className="type-small mt-2 text-muted">{item.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-muted">
                <span className="type-caption">Published {formatGuideDate(item.publishedAt, locale)}</span>
                <span className="type-caption">{item.readingMinutes} min read</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
