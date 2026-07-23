import "server-only";

import {listSectionDocuments} from "@/services/firestore/admin-content-service";
import type {
  ContactContentFields,
  FeaturedCutFields,
  HeroContentFields,
  ReviewContentFields,
  SeoContentFields,
  SiteHealthCheck,
} from "@/types/admin-cms";

function makeCheck(
  id: string,
  title: string,
  condition: boolean,
  okMessage: string,
  warningMessage: string,
): SiteHealthCheck {
  return {
    id,
    title,
    status: condition ? "ok" : "warning",
    message: condition ? okMessage : warningMessage,
  };
}

export async function runSiteHealthChecks(): Promise<SiteHealthCheck[]> {
  const [heroDocs, featuredCuts, reviews, contacts, seoDocs] = await Promise.all([
    listSectionDocuments<HeroContentFields>("hero"),
    listSectionDocuments<FeaturedCutFields>("featuredCuts"),
    listSectionDocuments<ReviewContentFields>("reviews"),
    listSectionDocuments<ContactContentFields>("contact"),
    listSectionDocuments<SeoContentFields>("seo"),
  ]);

  const hero = heroDocs[0]?.publishedData ?? heroDocs[0]?.data;
  const contact = contacts[0]?.publishedData ?? contacts[0]?.data;
  const seo = seoDocs[0]?.publishedData ?? seoDocs[0]?.data;

  const checks: SiteHealthCheck[] = [
    makeCheck(
      "hero-video",
      "Hero video exists",
      Boolean(hero?.heroVideoUrl),
      "Hero video is configured.",
      "Hero video is missing.",
    ),
    makeCheck(
      "hero-poster",
      "Poster exists",
      Boolean(hero?.heroPosterUrl),
      "Hero poster image is configured.",
      "Hero poster image is missing.",
    ),
    makeCheck(
      "instagram-config",
      "Instagram configured",
      Boolean(contact?.instagram),
      "Instagram link is configured.",
      "Instagram link is missing.",
    ),
    makeCheck(
      "whatsapp-config",
      "WhatsApp configured",
      Boolean(contact?.whatsapp),
      "WhatsApp link is configured.",
      "WhatsApp link is missing.",
    ),
    makeCheck(
      "seo-complete",
      "SEO complete",
      Boolean(seo?.metaTitle && seo?.metaDescription && seo?.canonicalUrl),
      "Core SEO fields are configured.",
      "SEO core fields are incomplete.",
    ),
    makeCheck(
      "featured-cuts",
      "Featured cuts available",
      featuredCuts.length > 0,
      "Featured cuts exist.",
      "No featured cuts found.",
    ),
    makeCheck(
      "featured-cuts-alt",
      "ALT text coverage",
      featuredCuts.every((item) => Boolean(item.data.alt)),
      "All featured cuts have ALT text.",
      "Some featured cuts are missing ALT text.",
    ),
    makeCheck(
      "reviews-available",
      "Reviews available",
      reviews.length > 0,
      "Reviews are available.",
      "No reviews found.",
    ),
  ];

  return checks;
}
