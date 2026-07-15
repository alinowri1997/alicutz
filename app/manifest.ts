import type {MetadataRoute} from "next";

import {SITE_NAME, SITE_URL} from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Alicutz premium barber website for Istanbul appointments.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#090807",
    theme_color: "#090807",
    orientation: "portrait",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["business", "lifestyle", "beauty"],
    lang: "tr",
    dir: "ltr",
    scope: SITE_URL,
  };
}
