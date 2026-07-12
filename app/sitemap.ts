import type {MetadataRoute} from "next";

import {defaultLocale, locales} from "@/i18n/routing";
import {LOCALE_PAGE_PATHS, SITE_URL} from "@/lib/seo";

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
            locales.map((altLocale) => [altLocale, `${SITE_URL}/${altLocale}${path}`]),
          ),
        },
      });
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
