import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {buildLanguageAlternates, SITE_URL} from "@/lib/seo";
import {defaultLocale, routing} from "@/i18n/routing";

interface PrivacyPageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: PrivacyPageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({locale, namespace: "PrivacyPage"});

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/privacy`,
      languages: buildLanguageAlternates("/privacy"),
    },
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      url: `${SITE_URL}/${locale}/privacy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("metadata.title"),
      description: t("metadata.description"),
    },
  };
}

export default async function PrivacyPage({params}: PrivacyPageProps): Promise<React.JSX.Element> {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: "PrivacyPage"});

  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">{t("title")}</h1>
      <p className="type-body mt-4 text-muted">{t("body")}</p>
    </main>
  );
}
