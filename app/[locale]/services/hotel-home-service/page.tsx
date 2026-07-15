import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {LandingPage} from "@/components/seo/landing-page";
import {
  buildSeoPageMetadata,
  buildSeoPageSchemas,
  getSeoPageCopy,
  getSeoPageLinks,
  type SeoPageKey,
} from "@/lib/seo-landing-pages";
import {defaultLocale, routing, type AppLocale} from "@/i18n/routing";

const PAGE_KEY: SeoPageKey = "hotelHomeService";

interface HotelHomeServicePageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: HotelHomeServicePageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  return buildSeoPageMetadata(locale, PAGE_KEY);
}

export default async function HotelHomeServicePage({params}: HotelHomeServicePageProps): Promise<React.JSX.Element> {
  const {locale: rawLocale} = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const copy = getSeoPageCopy(locale, PAGE_KEY);

  return (
    <LandingPage
      heading={copy.heading}
      summary={copy.summary}
      links={getSeoPageLinks(locale, PAGE_KEY)}
      schemas={buildSeoPageSchemas(locale, PAGE_KEY)}
    />
  );
}
