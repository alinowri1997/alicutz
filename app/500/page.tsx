import type {Metadata} from "next";
import Link from "next/link";

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Server Error | Ali Cutz",
  description: "A server error occurred while loading Ali Cutz.",
  alternates: {
    canonical: `${SITE_URL}/500`,
  },
  openGraph: {
    title: "Server Error | Ali Cutz",
    description: "A server error occurred while loading Ali Cutz.",
    url: `${SITE_URL}/500`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Ali Cutz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Server Error | Ali Cutz",
    description: "A server error occurred while loading Ali Cutz.",
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`],
  },
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
