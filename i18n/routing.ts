import {defineRouting} from "next-intl/routing";

export const locales = ["tr", "en", "ar", "de", "fa", "ru"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "tr";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const isRtlLocale = (locale: AppLocale): boolean => locale === "ar" || locale === "fa";
