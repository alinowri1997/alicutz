"use client";

import {useEffect} from "react";
import {useTranslations} from "next-intl";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  const t = useTranslations("SystemPages");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">{t("errorTitle")}</h1>
      <p className="type-body mt-4 max-w-[56ch] text-muted">
        {t("errorDescription")}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="type-small mt-8 inline-flex items-center rounded-full border border-border px-5 py-2 text-text transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent focus-visible:outline-none"
      >
        {t("retry")}
      </button>
    </main>
  );
}
