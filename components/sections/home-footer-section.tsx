import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { CONTACT_EMAIL, CONTACT_EMAIL_LINK, HOME_LOCALE_CODES, INSTAGRAM_LINK } from "@/constants/homepage";
import { Link as LocaleLink } from "@/i18n/navigation";

const FOOTER_NAV = [
  { key: "home", href: "#home" },
  { key: "services", href: "#services" },
  { key: "about", href: "#about" },
  { key: "instagram", href: "#portfolio" },
  { key: "contact", href: "#contact" },
];

export async function HomeFooterSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("HomeFooter");

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <p className="type-h5 text-text">ALI CUTZ</p>
            <p className="type-small text-muted">{t("brandDescription")}</p>
          </div>

          <div>
            <p className="type-caption mb-3 text-muted">{t("navigation")}</p>
            <ul className="space-y-2">
              {FOOTER_NAV.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    className="type-small inline-flex min-h-11 items-center py-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="type-caption mb-3 text-muted">{t("languages")}</p>
            <ul className="space-y-2">
              {HOME_LOCALE_CODES.map((localeCode) => (
                <li key={localeCode} className="type-small text-text">
                  {t(`languageNames.${localeCode}`)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="type-caption mb-3 text-muted">{t("social")}</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-small inline-flex min-h-11 items-center py-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href={CONTACT_EMAIL_LINK}
                  className="type-small inline-flex min-h-11 items-center py-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
                >
                  {CONTACT_EMAIL}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-small text-muted">{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <LocaleLink
              href="/privacy"
              prefetch={false}
              className="type-small inline-flex min-h-11 items-center py-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
            >
              {t("privacy")}
            </LocaleLink>
            <LocaleLink
              href="/terms"
              prefetch={false}
              className="type-small inline-flex min-h-11 items-center py-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
            >
              {t("terms")}
            </LocaleLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
