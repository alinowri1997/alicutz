import type { Timestamp } from "firebase/firestore";

export interface BaseContentDocument {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Hero extends BaseContentDocument {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  mediaPath?: string;
  mediaType?: "image" | "video";
  isActive: boolean;
}

export interface GalleryImage extends BaseContentDocument {
  title: string;
  alt: string;
  imagePath: string;
  instagramUrl?: string;
  order: number;
  isFeatured: boolean;
}

export interface Service extends BaseContentDocument {
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Review extends BaseContentDocument {
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  content: string;
  avatarPath?: string;
  isApproved: boolean;
  isFeatured: boolean;
}

export interface Settings extends BaseContentDocument {
  whatsappNumber: string;
  instagramHandle: string;
  salonArea: string;
  localeDefault: string;
  seoTitleTemplate?: string;
  seoDescriptionDefault?: string;
}

export interface LanguageEntry extends BaseContentDocument {
  code: string;
  label: string;
  direction: "ltr" | "rtl";
  isEnabled: boolean;
}
