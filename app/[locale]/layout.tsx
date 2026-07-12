import type {Metadata} from "next";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {NavigationBar} from "@/components/layout";
import {buildLanguageAlternates, localeToLanguageTag, SITE_URL} from "@/lib/seo";
import {defaultLocale, isRtlLocale, locales, routing, type AppLocale} from "@/i18n/routing";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}

export function generateStaticParams(): Array<{locale: AppLocale}> {
  return locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({locale, namespace: "Layout"});
  const localeTag = localeToLanguageTag[locale];

  return {
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: buildLanguageAlternates(""),
    },
    openGraph: {
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      url: `${SITE_URL}/${locale}`,
      locale: localeTag,
      type: "website",
    },
    twitter: {
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({children, params}: LocaleLayoutProps): Promise<React.JSX.Element> {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({locale});
  const t = await getTranslations({locale, namespace: "Layout"});

  return (
    <div lang={localeToLanguageTag[locale]} dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
        <a
          href="#main-content"
          className="type-small sr-only fixed left-4 top-4 z-[100] rounded-md bg-surface px-4 py-2 text-text focus:not-sr-only"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavigationBar />
          {children}
        </NextIntlClientProvider>
    </div>
  );
}
