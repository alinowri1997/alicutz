import {defineRouting} from "next-intl/routing";

export const locales = ["en", "fa", "de", "tr", "ar", "ru"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const isRtlLocale = (locale: AppLocale): boolean => locale === "ar" || locale === "fa";
