import type {MetadataRoute} from "next";

import {defaultLocale, locales} from "@/i18n/routing";
import {localeToHrefLang, LOCALE_PAGE_PATHS, SITE_URL} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of LOCALE_PAGE_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((altLocale) => [localeToHrefLang[altLocale], `${SITE_URL}/${altLocale}${path}`]),
          ),
        },
      });

      const latestEntry = entries[entries.length - 1];
      latestEntry.alternates = {
        languages: {
          ...(latestEntry.alternates?.languages ?? {}),
          "x-default": `${SITE_URL}/${defaultLocale}${path}`,
        },
      };
    }
  }

  entries.push({
    url: `${SITE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
    alternates: {
      languages: {
        "x-default": `${SITE_URL}/${defaultLocale}`,
      },
    },
  });

  return entries;
}
