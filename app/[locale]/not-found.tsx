import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";

export default async function LocaleNotFound(): Promise<React.JSX.Element> {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: "Navigation"});

  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">{t("items.home")}</h1>
      <p className="type-body mt-4 max-w-[56ch] text-muted">
        The requested page could not be found.
      </p>
      <Link
        href={`/${locale}`}
        className="type-small mt-8 inline-flex items-center text-accent transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none"
      >
        {t("items.home")}
      </Link>
    </main>
  );
}
