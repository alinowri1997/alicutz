import {type AppLocale} from "@/i18n/routing";

export const LOCALE_PREFERENCE_KEY = "alicutz-preferred-locale";

export function setStoredLocalePreference(locale: AppLocale): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_PREFERENCE_KEY, locale);
}
