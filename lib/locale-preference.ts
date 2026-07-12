import {locales, type AppLocale} from "@/i18n/routing";

export const LOCALE_PREFERENCE_KEY = "alicutz-preferred-locale";

export function getStoredLocalePreference(): AppLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_PREFERENCE_KEY);

  if (!storedLocale) {
    return null;
  }

  return locales.includes(storedLocale as AppLocale) ? (storedLocale as AppLocale) : null;
}

export function setStoredLocalePreference(locale: AppLocale): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_PREFERENCE_KEY, locale);
}
