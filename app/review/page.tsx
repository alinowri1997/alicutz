import type {Metadata} from "next";

import {ReviewLanding} from "@/components/reviews/review-landing";
import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Client Reviews | Alicutz",
  description: "Read and submit client reviews for Alicutz in a simple, permanent review page.",
  alternates: {
    canonical: "/review",
  },
  openGraph: {
    title: "Client Reviews | Alicutz",
    description: "Read and submit client reviews for Alicutz in a simple, permanent review page.",
    url: `${SITE_URL}/review`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Alicutz reviews page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Reviews | Alicutz",
    description: "Read and submit client reviews for Alicutz in a simple, permanent review page.",
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`],
  },
};

export default function ReviewPage(): React.JSX.Element {
  return <ReviewLanding />;
}