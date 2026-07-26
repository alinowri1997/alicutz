import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {GuidesListView} from "@/components/guides";
import {defaultLocale, locales, routing, type AppLocale} from "@/i18n/routing";
import {getGuideCategories, getGuides, toCategoryLabel} from "@/lib/guides";
import {buildLanguageAlternates, localeToLanguageTag, SITE_URL} from "@/lib/seo";

interface GuidesCategoryPageProps {
  params: Promise<{locale: string; category: string}>;
  searchParams: Promise<{q?: string; page?: string}>;
}

export async function generateMetadata({params}: GuidesCategoryPageProps): Promise<Metadata> {
  const {locale: rawLocale, category} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const categoryLabel = toCategoryLabel(category);

  return {
    title: `${categoryLabel} Guides | Ali Cutz`,
    description: `Premium ${categoryLabel.toLowerCase()} guidance for private barber clients in Istanbul.`,
    alternates: {
      canonical: `${SITE_URL}/${locale}/guides/category/${category}`,
      languages: buildLanguageAlternates(`/guides/category/${category}`),
    },
    openGraph: {
      title: `${categoryLabel} Guides | Ali Cutz`,
      description: `Premium ${categoryLabel.toLowerCase()} guidance for private barber clients in Istanbul.`,
      url: `${SITE_URL}/${locale}/guides/category/${category}`,
      type: "website",
      locale: localeToLanguageTag[locale],
      alternateLocale: locales.filter((entry) => entry !== locale).map((entry) => localeToLanguageTag[entry]),
    },
  };
}

export default async function GuidesCategoryPage({
  params,
  searchParams,
}: GuidesCategoryPageProps): Promise<React.JSX.Element> {
  const {locale: rawLocale, category} = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const query = await searchParams;
  const page = Number.parseInt(query.page ?? "1", 10);
  const currentPage = Number.isNaN(page) ? 1 : page;
  const searchValue = query.q?.trim() ?? "";

  const [guides, categories] = await Promise.all([
    getGuides({
      locale,
      page: currentPage,
      category,
      search: searchValue,
    }),
    getGuideCategories(locale),
  ]);

  if (guides.totalItems === 0 && !searchValue) {
    notFound();
  }

  const categoryLabel = toCategoryLabel(category);

  return (
    <GuidesListView
      locale={locale}
      title={`${categoryLabel} Guides`}
      description="Curated private barber knowledge for premium appointments in Istanbul."
      searchValue={searchValue}
      selectedCategory={category}
      categories={categories}
      items={guides.items}
      totalItems={guides.totalItems}
      page={guides.page}
      totalPages={guides.totalPages}
      basePath={`/guides/category/${category}`}
    />
  );
}
