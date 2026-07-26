import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {GuidesListView} from "@/components/guides";
import {defaultLocale, locales, routing, type AppLocale} from "@/i18n/routing";
import {getGuidesCopy} from "@/lib/guides-i18n";
import {buildLanguageAlternates, localeToLanguageTag, SITE_URL} from "@/lib/seo";
import {getGuideCategories, getGuides} from "@/lib/guides";

interface GuidesPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string; category?: string; page?: string}>;
}

export async function generateMetadata({params}: GuidesPageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const copy = getGuidesCopy(locale);

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides`,
      languages: buildLanguageAlternates("/guides"),
    },
    openGraph: {
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      url: `${SITE_URL}/${locale}/guides`,
      type: "website",
      locale: localeToLanguageTag[locale],
      alternateLocale: locales.filter((entry) => entry !== locale).map((entry) => localeToLanguageTag[entry]),
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metadataTitle,
      description: copy.metadataDescription,
    },
  };
}

export default async function GuidesPage({params, searchParams}: GuidesPageProps): Promise<React.JSX.Element> {
  const {locale: rawLocale} = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const query = await searchParams;
  const page = Number.parseInt(query.page ?? "1", 10);
  const currentPage = Number.isNaN(page) ? 1 : page;
  const searchValue = query.q?.trim() ?? "";
  const selectedCategory = query.category?.trim();

  const [guides, categories] = await Promise.all([
    getGuides({
      locale,
      page: currentPage,
      category: selectedCategory,
      search: searchValue,
    }),
    getGuideCategories(locale),
  ]);

  const copy = getGuidesCopy(locale);

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
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.listTitle,
    description: copy.listDescription,
    url: `${SITE_URL}/${locale}/guides`,
    inLanguage: locale,
    about: guides.items.map((guide) => ({
      "@type": "Article",
      headline: guide.title,
      description: guide.excerpt,
      url: `${SITE_URL}/${locale}/guides/${guide.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(collectionSchema)}}
      />

      <GuidesListView
        locale={locale}
        title={copy.listTitle}
        description={copy.listDescription}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
        categories={categories}
        items={guides.items}
        totalItems={guides.totalItems}
        page={guides.page}
        totalPages={guides.totalPages}
        basePath="/guides"
      />
    </>
  );
}
