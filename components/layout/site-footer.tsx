"use client";

import {MessageCircle} from "lucide-react";
import {FaInstagram} from "react-icons/fa";
import {useLocale, useTranslations} from "next-intl";

import {Link, usePathname} from "@/i18n/navigation";
import {locales, type AppLocale} from "@/i18n/routing";
import {INSTAGRAM_LINK, WHATSAPP_LINK} from "@/constants/homepage";

interface FooterNavItem {
  key: "home" | "services" | "about" | "guides" | "instagram" | "contact";
  href: string;
  target?: "_blank";
  rel?: string;
}

const FOOTER_NAV_ITEMS: FooterNavItem[] = [
  {key: "home", href: "/"},
  {key: "services", href: "#services"},
  {key: "about", href: "#about"},
  {key: "guides", href: "/guides"},
  {key: "instagram", href: INSTAGRAM_LINK, target: "_blank", rel: "noopener noreferrer"},
  {key: "contact", href: "#contact"},
];

export function SiteFooter(): React.JSX.Element {
  const t = useTranslations("HomeFooter");
  const locale = useLocale();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const resolveHref = (href: string): string => {
    if (!href.startsWith("#")) {
      return href;
    }

    return pathname === "/" ? href : `/${locale}${href}`;
  };

  return (
    <footer className="border-t border-border/70 bg-surface/40 py-12">
      <div className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="type-h6 tracking-[0.2em] uppercase text-text">ALICUTZ</p>
          <p className="type-small max-w-[28ch] text-muted">{t("brandDescription")}</p>
        </div>

        <div>
          <p className="type-caption text-muted">{t("navigation")}</p>
          <ul className="mt-3 space-y-2">
            {FOOTER_NAV_ITEMS.map((item) => (
              <li key={item.key}>
                {item.href.startsWith("http") ? (
                  <a href={item.href} target={item.target} rel={item.rel} className="type-small text-muted transition-colors hover:text-text">
                    {t(`nav.${item.key}`)}
                  </a>
                ) : (
                  <Link href={resolveHref(item.href)} className="type-small text-muted transition-colors hover:text-text">
                    {t(`nav.${item.key}`)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="type-caption text-muted">{t("languages")}</p>
          <ul className="mt-3 space-y-2">
            {locales.map((localeItem) => (
              <li key={localeItem}>
                <Link href={pathname} locale={localeItem as AppLocale} className="type-small text-muted transition-colors hover:text-text">
                  {t(`languageNames.${localeItem}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="type-caption text-muted">{t("social")}</p>
          <div className="mt-3 flex flex-col items-start gap-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="type-small inline-flex items-center gap-2 text-muted transition-colors hover:text-text">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Consultation
            </a>
            <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="type-small inline-flex items-center gap-2 text-muted transition-colors hover:text-text">
              <FaInstagram className="h-4 w-4" aria-hidden="true" />
              Instagram
            </a>
            <Link href="/privacy" className="type-small text-muted transition-colors hover:text-text">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="type-small text-muted transition-colors hover:text-text">
              {t("terms")}
            </Link>
            <Link href="/admin" className="type-small text-muted transition-colors hover:text-text">
              Management
            </Link>
          </div>
        </div>
      </div>

      <div className="container mt-10 border-t border-border/70 pt-5">
        <p className="type-caption text-muted">{t("copyright", {year})}</p>
      </div>
    </footer>
  );
}
