import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Server Error | Ali Cutz",
  description: "A server error occurred while loading Ali Cutz.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ServerErrorPage(): React.JSX.Element {
  return (
    <main className="container py-32">
      <h1 className="type-h2 text-text">Server Error</h1>
      <p className="type-body mt-4 max-w-[56ch] text-muted">
        We could not complete this request right now. Please try again.
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
