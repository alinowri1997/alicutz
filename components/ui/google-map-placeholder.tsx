import Link from "next/link";
import {MapPin} from "lucide-react";

export interface GoogleMapPlaceholderProps {
  title: string;
  query: string;
  actionLabel: string;
}

export function GoogleMapPlaceholder({title, query, actionLabel}: GoogleMapPlaceholderProps): React.JSX.Element {
  const href = `https://maps.google.com/?q=${encodeURIComponent(query)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md" aria-label={title}>
      <div className="flex h-[420px] w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-primary via-secondary to-background px-6 text-center">
        <MapPin className="h-8 w-8 text-accent" aria-hidden="true" />
        <p className="type-small max-w-[34ch] text-muted">{title}</p>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="type-small inline-flex min-h-11 items-center text-accent transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none focus-visible:text-text"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
