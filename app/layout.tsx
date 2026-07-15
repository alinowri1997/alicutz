import type {Metadata, Viewport} from "next";

import {
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_TITLE_TEMPLATE,
  SITE_URL,
} from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: [
    "Men's Barber Istanbul",
    "Barber Istanbul",
    "Barber Bomonti",
    "Barber Sisli",
    "Skin Fade Istanbul",
    "Haircut Istanbul",
    "Beard Styling Istanbul",
    "Hair Coloring Istanbul",
    "Hair Therapy Istanbul",
    "Facial Therapy Istanbul",
    "Premium Barber Istanbul",
  ],
  authors: [{ name: "Alicutz" }],
  creator: "Alicutz",
  publisher: "Alicutz",
  category: "Barber Shop",
  description: "Premium men's barber in Istanbul with private hotel and residence appointments.",
  title: {
    default: SITE_NAME,
    template: SITE_TITLE_TEMPLATE,
  },
  alternates: {
    canonical: "/tr",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon?size=32", type: "image/png", sizes: "32x32" },
      { url: "/icon?size=192", type: "image/png", sizes: "192x192" },
      { url: "/icon?size=512", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: SITE_NAME,
    description: "Premium men's barber in Istanbul with private hotel and residence appointments.",
    url: `${SITE_URL}/tr`,
    locale: "tr-TR",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: "Ali Cutz premium barber work in Istanbul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Premium men's barber in Istanbul with private hotel and residence appointments.",
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090807",
};

export default function RootLayout({children}: {children: React.ReactNode}): React.JSX.Element {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
