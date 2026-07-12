import type {Metadata} from "next";

import {locales, type AppLocale} from "@/i18n/routing";

export const SITE_URL = "https://alicutz.com";
export const SITE_NAME = "Ali Cutz";
export const SITE_TITLE_TEMPLATE = "%s | Ali Cutz";

export const LOCALE_PAGE_PATHS = ["", "/privacy", "/terms"] as const;

export const localeToHrefLang: Record<AppLocale, string> = {
  en: "en",
  fa: "fa",
  de: "de",
  tr: "tr",
  ar: "ar",
  ru: "ru",
};

export const localeToLanguageTag: Record<AppLocale, string> = {
  en: "en-US",
  fa: "fa-IR",
  de: "de-DE",
  tr: "tr-TR",
  ar: "ar",
  ru: "ru-RU",
};

export function buildLanguageAlternates(pathname: string): NonNullable<Metadata["alternates"]>["languages"] {
  const alternates = Object.fromEntries(
    locales.map((locale) => [localeToHrefLang[locale], `${SITE_URL}/${locale}${pathname}`]),
  );

  return {
    ...alternates,
    "x-default": `${SITE_URL}/en${pathname}`,
  };
}

export function buildLocalizedUrl(locale: AppLocale, pathname = ""): string {
  return `${SITE_URL}/${locale}${pathname}`;
}
