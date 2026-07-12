"use client";

import * as React from "react";
import {useLocale} from "next-intl";

import {usePathname, useRouter} from "@/i18n/navigation";
import {defaultLocale, type AppLocale} from "@/i18n/routing";
import {getStoredLocalePreference, setStoredLocalePreference} from "@/lib/locale-preference";

export function LocalePreferenceSync(): null {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedPreference = React.useRef(false);

  React.useEffect(() => {
    if (!hasCheckedPreference.current) {
      hasCheckedPreference.current = true;
      const storedLocale = getStoredLocalePreference();

      if (!storedLocale && locale !== defaultLocale) {
        router.replace(pathname, {locale: defaultLocale});
        return;
      }

      if (storedLocale && storedLocale !== locale) {
        router.replace(pathname, {locale: storedLocale});
        return;
      }
    }

    setStoredLocalePreference(locale);
  }, [locale, pathname, router]);

  return null;
}
