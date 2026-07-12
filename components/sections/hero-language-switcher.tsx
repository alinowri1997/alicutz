"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const SCROLL_RESTORE_KEY = "hero-language-switch-scroll-y";

const HERO_LANGUAGES: Array<{ locale: AppLocale; label: string; flag: string; name: string }> = [
  { locale: "tr", label: "TR", flag: "🇹🇷", name: "Turkish" },
  { locale: "en", label: "EN", flag: "🇬🇧", name: "English" },
  { locale: "de", label: "DE", flag: "🇩🇪", name: "German" },
  { locale: "fa", label: "FA", flag: "🇮🇷", name: "Persian" },
  { locale: "ar", label: "AR", flag: "🇸🇦", name: "Arabic" },
  { locale: "ru", label: "RU", flag: "🇷🇺", name: "Russian" },
];

export function HeroLanguageSwitcher(): React.JSX.Element {
  const t = useTranslations("Hero");
  const currentLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_RESTORE_KEY);

    if (!savedScroll) {
      return;
    }

    sessionStorage.removeItem(SCROLL_RESTORE_KEY);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Number(savedScroll), behavior: "auto" });
    });
  }, [currentLocale, pathname]);

  const handleLocaleSwitch = (nextLocale: AppLocale): void => {
    if (!locales.includes(nextLocale) || nextLocale === currentLocale) {
      return;
    }

    sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY));
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t("supportedLanguagesAria")}>
      {HERO_LANGUAGES.map((language) => {
        const isActive = currentLocale === language.locale;

        return (
          <button
            key={language.locale}
            type="button"
            onClick={() => handleLocaleSwitch(language.locale)}
            className={cn(
              "type-caption inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isActive
                ? "border-accent/60 text-accent"
                : "border-border text-muted hover:border-accent/50 hover:text-text",
            )}
            aria-label={`${language.name} (${language.label})`}
            aria-pressed={isActive}
            title={language.name}
          >
            <span aria-hidden="true">{language.flag}</span>
            <span>{language.label}</span>
          </button>
        );
      })}
    </div>
  );
}