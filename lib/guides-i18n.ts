import type {AppLocale} from "@/i18n/routing";

interface GuidesCopy {
  listTitle: string;
  listDescription: string;
  metadataTitle: string;
  metadataDescription: string;
}

const COPY: Record<AppLocale, GuidesCopy> = {
  tr: {
    listTitle: "Ali Cutz Rehberleri",
    listDescription:
      "Istanbul'da premium bakim ritmini korumak icin ozel barber rehberleri: seyahat, fade bakimi, sakal sekillendirme ve ozel randevu standardlari.",
    metadataTitle: "Rehberler | Ali Cutz",
    metadataDescription:
      "Istanbul'da premium erkek bakimi ve ozel barber randevulari icin uzman rehberler.",
  },
  en: {
    listTitle: "Ali Cutz Guides",
    listDescription:
      "Premium barber knowledge for Istanbul clients: private appointment etiquette, hotel grooming routines, fade maintenance, and confidence-first styling.",
    metadataTitle: "Guides | Ali Cutz",
    metadataDescription:
      "Expert grooming and private barber guides for men in Istanbul.",
  },
  de: {
    listTitle: "Ali Cutz Ratgeber",
    listDescription:
      "Premium Barber Wissen fur Istanbul: private Termine, Hotel Grooming, Fade Pflege und Bartkontur Standards.",
    metadataTitle: "Ratgeber | Ali Cutz",
    metadataDescription:
      "Expertenwissen fur private Barber Termine und Herren Grooming in Istanbul.",
  },
  ar: {
    listTitle: "Ali Cutz Guides",
    listDescription:
      "Premium private barber knowledge for Istanbul clients: hotel routines, beard standards, and clean fade maintenance.",
    metadataTitle: "Guides | Ali Cutz",
    metadataDescription:
      "Private grooming guides for premium barber appointments in Istanbul.",
  },
  fa: {
    listTitle: "Ali Cutz Guides",
    listDescription:
      "Private barber guides for Istanbul clients: hotel grooming routine, beard balance, and fade maintenance principles.",
    metadataTitle: "Guides | Ali Cutz",
    metadataDescription:
      "Premium men's grooming guides for private barber appointments in Istanbul.",
  },
  ru: {
    listTitle: "Ali Cutz Guides",
    listDescription:
      "Premium private barber knowledge for Istanbul: hotel-ready grooming, clean fade upkeep, and beard detailing routines.",
    metadataTitle: "Guides | Ali Cutz",
    metadataDescription:
      "Expert men's grooming guides for private appointments in Istanbul.",
  },
};

export function getGuidesCopy(locale: AppLocale): GuidesCopy {
  return COPY[locale];
}
