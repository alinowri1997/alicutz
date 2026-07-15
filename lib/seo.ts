import type {Metadata} from "next";

import {locales, type AppLocale} from "@/i18n/routing";

export const SITE_URL = "https://alicutz.com";
export const SITE_NAME = "Alicutz";
export const SITE_TITLE_TEMPLATE = "%s | Alicutz";
export const DEFAULT_OG_IMAGE_PATH = "/gallery/mens-skin-fade-istanbul-premium-barber.jpg";
export const DEFAULT_OG_IMAGE_WIDTH = 1920;
export const DEFAULT_OG_IMAGE_HEIGHT = 2560;

export const LOCALE_PAGE_PATHS = [
  "",
  "/privacy",
  "/terms",
  "/services",
  "/services/haircut",
  "/services/fade",
  "/services/beard",
  "/services/hair-coloring",
  "/services/hotel-home-service",
  "/contact",
  "/gallery",
] as const;

export const localeToHrefLang: Record<AppLocale, string> = {
  en: "en",
  fa: "fa-IR",
  de: "de",
  tr: "tr-TR",
  ar: "ar-SA",
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
    "x-default": `${SITE_URL}/tr${pathname}`,
  };
}

export function buildLocalizedUrl(locale: AppLocale, pathname = ""): string {
  return `${SITE_URL}/${locale}${pathname}`;
}
