export type PublishState = "draft" | "published";

export type AdminContentSection =
  | "hero"
  | "featuredCuts"
  | "services"
  | "reviews"
  | "contact"
  | "siteSettings"
  | "seo"
  | "languages";

export const ADMIN_CONTENT_SECTIONS: readonly AdminContentSection[] = [
  "hero",
  "featuredCuts",
  "services",
  "reviews",
  "contact",
  "siteSettings",
  "seo",
  "languages",
] as const;

export const ADMIN_SINGLETON_SECTIONS: readonly AdminContentSection[] = [
  "hero",
  "contact",
  "siteSettings",
  "seo",
] as const;

export interface CmsBaseDocument {
  id: string;
  section: AdminContentSection;
  order: number;
  status: PublishState;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroContentFields {
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  heroVideoUrl: string;
  heroVideoPath: string;
  heroPosterUrl: string;
  heroPosterPath: string;
}

export interface FeaturedCutFields {
  imageUrl: string;
  imagePath: string;
  instagramPostUrl: string;
  title?: string;
  alt: string;
  enabled: boolean;
}

export interface ServiceContentFields {
  slug: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface ReviewContentFields {
  customerName: string;
  country: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  photoUrl?: string;
  photoPath?: string;
  approved: boolean;
}

export interface ContactContentFields {
  instagram: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  googleMaps: string;
  businessHours: string;
}

export interface SiteSettingsContentFields {
  siteName: string;
  logoUrl: string;
  logoPath: string;
  theme: "dark" | "light";
  defaultLocale: string;
  bookingUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  phoneNumber: string;
  email: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  metaTitleTemplate: string;
  metaDescription: string;
  googleAnalyticsId: string;
  metaPixelId: string;
}

export interface SeoContentFields {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImageUrl: string;
  twitterCard: "summary" | "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  robots: string;
  sitemapEnabled: boolean;
  sitemapBaseUrl: string;
  faviconUrl: string;
}

export interface LanguageContentFields {
  code: string;
  label: string;
  direction: "ltr" | "rtl";
  enabled: boolean;
  order: number;
}

export interface CmsDocument<TFields> extends CmsBaseDocument {
  data: TFields;
  publishedData: TFields | null;
}

export type AdminMediaFolder = "Hero" | "Gallery" | "Reviews" | "Logo" | "General";

export const ADMIN_MEDIA_FOLDERS: readonly AdminMediaFolder[] = [
  "Hero",
  "Gallery",
  "Reviews",
  "Logo",
  "General",
] as const;

export interface MediaAsset {
  id: string;
  folder: AdminMediaFolder;
  fileName: string;
  storagePath: string;
  contentType: string;
  size: number;
  downloadUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  actorUid: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetSection?: AdminContentSection;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface SiteHealthCheck {
  id: string;
  title: string;
  status: "ok" | "warning";
  message: string;
}

export type WorkflowAction = "publish" | "discard" | "approve" | "hide" | "enable" | "disable";
