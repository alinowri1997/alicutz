import type {MetadataRoute} from "next";

import {defaultLocale, locales} from "@/i18n/routing";
import {getAllGuideSeriesSlugs, getAllGuideSlugs} from "@/lib/guides";
import {localeToHrefLang, LOCALE_PAGE_PATHS, SITE_URL} from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const guideSlugs = await getAllGuideSlugs();
  const seriesSlugs = await getAllGuideSeriesSlugs();

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

  for (const locale of locales) {
    for (const slug of guideSlugs) {
      const path = `/guides/${slug}`;

      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((altLocale) => [localeToHrefLang[altLocale], `${SITE_URL}/${altLocale}${path}`]),
            ),
            "x-default": `${SITE_URL}/${defaultLocale}${path}`,
          },
        },
      });
    }

    for (const slug of seriesSlugs) {
      const path = `/guides/series/${slug}`;

      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((altLocale) => [localeToHrefLang[altLocale], `${SITE_URL}/${altLocale}${path}`]),
            ),
            "x-default": `${SITE_URL}/${defaultLocale}${path}`,
          },
        },
      });
    }
  }

  return entries;
}
