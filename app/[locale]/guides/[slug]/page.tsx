import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {compileMDX} from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import {GuideArticleView, guideMdxComponents} from "@/components/guides";
import {defaultLocale, locales, routing, type AppLocale} from "@/i18n/routing";
import {getAllGuideSlugs, getContinueReadingGuides, getGuideBySlug, getGuideSeries} from "@/lib/guides";
import {buildLanguageAlternates, localeToLanguageTag, SITE_URL} from "@/lib/seo";

interface GuideArticlePageProps {
  params: Promise<{locale: string; slug: string}>;
}

export async function generateStaticParams(): Promise<Array<{locale: AppLocale; slug: string}>> {
  const slugs = await getAllGuideSlugs();

  return locales.flatMap((locale) => slugs.map((slug) => ({locale, slug})));
}

export async function generateMetadata({params}: GuideArticlePageProps): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const guide = await getGuideBySlug(locale, slug);

  if (!guide) {
    return {
      title: "Guide Not Found | Ali Cutz",
      description: "This guide is not available.",
    };
  }

  return {
    title: `${guide.item.title} | Ali Cutz Guides`,
    description: guide.item.description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides/${guide.item.slug}`,
      languages: buildLanguageAlternates(`/guides/${guide.item.slug}`),
    },
    openGraph: {
      title: `${guide.item.title} | Ali Cutz Guides`,
      description: guide.item.description,
      url: `${SITE_URL}/${locale}/guides/${guide.item.slug}`,
      type: "article",
      locale: localeToLanguageTag[locale],
      alternateLocale: locales.filter((entry) => entry !== locale).map((entry) => localeToLanguageTag[entry]),
      publishedTime: guide.item.publishedAt,
      modifiedTime: guide.item.updatedAt ?? guide.item.publishedAt,
      tags: guide.item.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.item.title} | Ali Cutz Guides`,
      description: guide.item.description,
    },
  };
}

export default async function GuideArticlePage({params}: GuideArticlePageProps): Promise<React.JSX.Element> {
  const {locale: rawLocale, slug} = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const guide = await getGuideBySlug(locale, slug);

  if (!guide) {
    notFound();
  }

  const [continueReading, series, compiled] = await Promise.all([
    getContinueReadingGuides(locale, guide.item, 3),
    getGuideSeries(locale, guide.item),
    compileMDX({
      source: guide.source,
      components: guideMdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      },
    }),
  ]);

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
        name: guide.item.title,
        item: `${SITE_URL}/${locale}/guides/${guide.item.slug}`,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.item.title,
    description: guide.item.description,
    datePublished: guide.item.publishedAt,
    dateModified: guide.item.updatedAt ?? guide.item.publishedAt,
    author: {
      "@type": "Organization",
      name: "Ali Cutz",
    },
    publisher: {
      "@type": "Organization",
      name: "Ali Cutz",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon?size=512`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/${locale}/guides/${guide.item.slug}`,
    inLanguage: locale,
    articleSection: guide.item.category,
    keywords: guide.item.tags,
    isPartOf: series
      ? {
          "@type": "CreativeWorkSeries",
          name: series.title,
          url: `${SITE_URL}/${locale}/guides/series/${series.slug}`,
        }
      : undefined,
  };

  const faqSchema =
    guide.item.faq && guide.item.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.item.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}} />
      {faqSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
      ) : null}

      <GuideArticleView
        locale={locale}
        guide={guide.item}
        content={compiled.content}
        continueReading={continueReading}
        series={series}
      />
    </>
  );
}
