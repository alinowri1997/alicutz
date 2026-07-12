import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";

export default async function LocaleNotFound(): Promise<React.JSX.Element> {
  const locale = await getLocale();
  const tNavigation = await getTranslations({locale, namespace: "Navigation"});
  const tSystem = await getTranslations({locale, namespace: "SystemPages"});

  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">{tSystem("notFoundTitle")}</h1>
      <p className="type-body mt-4 max-w-[56ch] text-muted">
        {tSystem("notFoundDescription")}
      </p>
      <Link
        href={`/${locale}`}
        className="type-small mt-8 inline-flex items-center text-accent transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none"
      >
        {tNavigation("items.home")}
      </Link>
    </main>
  );
}
