import {type LucideIcon, Scissors, Flame, Sparkles, Smile, Home, Brush} from "lucide-react";

import type {ReviewService, ReviewTag} from "@/lib/types/reviews";

export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
}

export interface ServiceOption {
  value: ReviewService;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface ReviewTagOption {
  value: ReviewTag;
  label: string;
}

export const REVIEW_TAG_OPTIONS: ReviewTagOption[] = [
  {value: "Haircut", label: "Haircut"},
  {value: "Fade", label: "Fade"},
  {value: "Beard", label: "Beard"},
  {value: "Color", label: "Color"},
  {value: "Friendly", label: "Friendly"},
  {value: "Fast Service", label: "Fast Service"},
  {value: "Home Service", label: "Home Service"},
  {value: "Professional", label: "Professional"},
  {value: "Clean Environment", label: "Clean Environment"},
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  {value: "Haircut", label: "Haircut", description: "Signature cuts and sharp edges", icon: Scissors},
  {value: "Fade", label: "Fade", description: "Skin, low, and mid fade work", icon: Flame},
  {value: "Beard", label: "Beard", description: "Shape, line, and detail work", icon: Smile},
  {value: "Color", label: "Color", description: "Color refresh and refinement", icon: Sparkles},
  {value: "Home Service", label: "Home Service", description: "Private service at your location", icon: Home},
  {value: "Other", label: "Other", description: "Something custom or not listed", icon: Brush},
];

export const SERVICE_FILTER_OPTIONS: Array<{value: "all" | ReviewService; label: string}> = [
  {value: "all", label: "All services"},
  ...SERVICE_OPTIONS.map((option) => ({value: option.value, label: option.label})),
];

const LANGUAGE_CODES = [
  "en",
  "tr",
  "de",
  "fr",
  "es",
  "it",
  "ar",
  "ru",
  "pt",
  "nl",
  "sv",
  "pl",
  "ja",
  "ko",
] as const;

export function buildLanguageOptions(preferredLocale?: string): LanguageOption[] {
  const labels = new Intl.DisplayNames([preferredLocale ?? "en"], {type: "language"});
  const nativeLabels = new Intl.DisplayNames(["en"], {type: "language"});

  return LANGUAGE_CODES.map((code) => ({
    code,
    label: labels.of(code) ?? code,
    nativeName: nativeLabels.of(code) ?? code,
  })).sort((a, b) => a.nativeName.localeCompare(b.nativeName));
}

export function getBrowserLanguageSeed(): {code: string; label: string; nativeName: string} {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  const baseCode = locale.split("-")[0]?.toLowerCase() || "en";
  const options = buildLanguageOptions(baseCode);
  return options.find((option) => option.code === baseCode) ?? options[0] ?? {code: "en", label: "English", nativeName: "English"};
}
