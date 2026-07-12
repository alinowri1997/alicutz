"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <main className="container py-32">
          <h1 className="type-h2 text-text">Something went wrong</h1>
          <p className="type-body mt-4 max-w-[56ch] text-muted">
            A server error occurred while loading this page.
          </p>
          {error.digest ? <p className="type-small mt-3 text-muted">Error ID: {error.digest}</p> : null}
          <button
            type="button"
            onClick={() => reset()}
            className="type-small mt-8 inline-flex items-center rounded-full border border-border px-5 py-2 text-text transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent focus-visible:outline-none"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
