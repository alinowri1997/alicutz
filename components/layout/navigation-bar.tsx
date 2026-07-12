"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { setStoredLocalePreference } from "@/lib/locale-preference";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  key: "home" | "services" | "about" | "instagram" | "contact";
  href: string;
}

export interface NavigationBarProps {
  logoText?: string;
  logoHref?: string;
  bookingLabel?: string;
  bookingHref?: string;
  items?: NavigationItem[];
}

const DEFAULT_ITEMS: NavigationItem[] = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "instagram", href: "#portfolio" },
  { key: "contact", href: "#contact" },
];

const MENU_ID = "mobile-navigation-menu";

export function NavigationBar({
  logoText,
  logoHref = "#home",
  bookingLabel,
  bookingHref = "https://wa.me/905441772249",
  items = DEFAULT_ITEMS,
}: NavigationBarProps): React.JSX.Element {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const menuPanelRef = React.useRef<HTMLDivElement>(null);
  const openButtonRef = React.useRef<HTMLButtonElement>(null);

  const effectiveLogoText = logoText ?? t("logoText");
  const effectiveBookingLabel = bookingLabel ?? t("bookViaWhatsApp");

  const handleLocaleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const nextLocale = event.target.value as AppLocale;
    setStoredLocalePreference(nextLocale);
    router.replace(pathname, { locale: nextLocale });
  };

  React.useEffect(() => {
    const onScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const focusableElements = menuPanelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusableElements?.[0]?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        openButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = menuPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-border/70 bg-background/65 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-18 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center">
          <Link
            href={logoHref}
            className="type-h5 whitespace-nowrap tracking-[0.08em] uppercase text-text"
          >
            {effectiveLogoText}
          </Link>
        </div>

        <nav aria-label={t("primaryNavigation")} className="hidden md:block">
          <ul className="flex items-center gap-7">
            {items.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="type-small relative text-muted transition-colors duration-200 hover:text-text focus-visible:outline-none focus-visible:text-text"
                >
                  {t(`items.${item.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3">
          <label className="type-caption text-muted" htmlFor="desktop-locale-switcher">
            {t("languageSwitcherLabel")}
          </label>
          <select
            id="desktop-locale-switcher"
            aria-label={t("languageSwitcherLabel")}
            className="type-caption rounded-full border border-border bg-surface px-3 py-2 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            value={locale}
            onChange={handleLocaleChange}
          >
            {locales.map((localeOption) => (
              <option key={localeOption} value={localeOption}>
                {localeOption.toUpperCase()}
              </option>
            ))}
          </select>
          <Link
            href={bookingHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }), "type-caption")}
          >
            {effectiveBookingLabel}
          </Link>
        </div>

        <button
          ref={openButtonRef}
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text transition-colors duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          aria-label={t("openNavigationMenu")}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={MENU_ID}
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-primary/65 backdrop-blur-md md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMenu}
            />

            <motion.div
              id={MENU_ID}
              ref={menuPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("mobileNavigation")}
              className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-background px-6 py-5 md:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <span className="type-h5 tracking-[0.08em] uppercase text-text">{effectiveLogoText}</span>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text transition-colors duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={t("closeNavigationMenu")}
                  onClick={closeMenu}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav aria-label={t("mobilePrimaryNavigation")} className="mt-12">
                <ul className="space-y-5">
                  {items.map((item, index) => (
                    <motion.li
                      key={item.key}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -14 }}
                      transition={{ duration: 0.22, delay: 0.05 + index * 0.04 }}
                    >
                      <a
                        href={item.href}
                        className="type-h3 text-text transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:text-accent"
                        onClick={closeMenu}
                      >
                        {t(`items.${item.key}`)}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto space-y-4 pb-6">
                <div className="space-y-2">
                  <label className="type-caption text-muted" htmlFor="mobile-locale-switcher">
                    {t("languageSwitcherLabel")}
                  </label>
                  <select
                    id="mobile-locale-switcher"
                    aria-label={t("languageSwitcherLabel")}
                    className="type-caption w-full rounded-full border border-border bg-surface px-4 py-3 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    value={locale}
                    onChange={handleLocaleChange}
                  >
                    {locales.map((localeOption) => (
                      <option key={localeOption} value={localeOption}>
                        {localeOption.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <Link
                  href={bookingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "accent", size: "lg" }),
                    "w-full type-caption",
                  )}
                  onClick={closeMenu}
                >
                  {effectiveBookingLabel}
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
