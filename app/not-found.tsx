import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">Page Not Found</h1>
      <p className="type-body mt-4 max-w-[56ch] text-muted">
        The page you are looking for is not available.
      </p>
      <Link
        href="/en"
        className="type-small mt-8 inline-flex items-center text-accent transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none"
      >
        Return to Home
      </Link>
    </main>
  );
}
