import {ArrowLeft, ArrowRight, BookOpenText} from "lucide-react";

import {Link} from "@/i18n/navigation";
import type {AppLocale} from "@/i18n/routing";
import type {GuideSeriesDetails} from "@/lib/guides";

interface SeriesNavigationProps {
  locale: AppLocale;
  series: GuideSeriesDetails;
}

export function SeriesNavigation({locale, series}: SeriesNavigationProps): React.JSX.Element {
  const currentPosition = series.currentIndex + 1;

  return (
    <section className="mt-14 rounded-2xl border border-border bg-surface p-6" aria-labelledby="series-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id="series-heading" className="type-caption inline-flex items-center gap-2 text-muted">
          <BookOpenText className="h-4 w-4" aria-hidden="true" />
          {series.title}
        </p>
        <p className="type-caption text-muted">Article {currentPosition} of {series.total}</p>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-background">
        <div className="h-full bg-accent" style={{width: `${series.progressPercent}%`}} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {series.previous ? (
          <Link
            href={`/guides/${series.previous.slug}`}
            locale={locale}
            className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-accent"
          >
            <span className="type-caption inline-flex items-center gap-1 text-muted">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous article
            </span>
            <span className="type-small mt-2 block text-text">{series.previous.title}</span>
          </Link>
        ) : (
          <div className="rounded-xl border border-border bg-background px-4 py-3 opacity-60">
            <span className="type-caption text-muted">Previous article</span>
            <span className="type-small mt-2 block text-text">Start of series</span>
          </div>
        )}

        {series.next ? (
          <Link
            href={`/guides/${series.next.slug}`}
            locale={locale}
            className="rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-accent"
          >
            <span className="type-caption inline-flex items-center gap-1 text-muted">
              Next article
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="type-small mt-2 block text-text">{series.next.title}</span>
          </Link>
        ) : (
          <div className="rounded-xl border border-border bg-background px-4 py-3 opacity-60">
            <span className="type-caption text-muted">Next article</span>
            <span className="type-small mt-2 block text-text">End of series</span>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Link href={`/guides/series/${series.slug}`} locale={locale} className="type-small text-muted underline decoration-border underline-offset-4 hover:text-text">
          View series page
        </Link>
      </div>
    </section>
  );
}
