import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {
  AboutSection,
  HeroSection,
  LatestWorkSection,
  LocationSection,
  ReviewsSection,
  ServicesSection,
} from "@/components/sections";
import {
  CONTACT_INFO,
  CORE_SERVICE_LABELS,
  GOOGLE_BUSINESS_LINK,
  INSTAGRAM_LINK,
  WHATSAPP_LINK,
} from "@/constants/homepage";
import {
  buildLanguageAlternates,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  localeToLanguageTag,
  SITE_URL,
} from "@/lib/seo";
import {defaultLocale, locales, routing} from "@/i18n/routing";

interface HomePageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({locale, namespace: "HomePage"});
  const localeTag = localeToLanguageTag[locale];
  const metadata = t.raw("metadata") as {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    imageAlt: string;
    keywords: string[];
  };

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: buildLanguageAlternates(""),
    },
    openGraph: {
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      url: `${SITE_URL}/${locale}`,
      type: "website",
      locale: localeTag,
      alternateLocale: locales.filter((entry) => entry !== locale).map((entry) => localeToLanguageTag[entry]),
      images: [
        {
          url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: metadata.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.twitterTitle,
      description: metadata.twitterDescription,
      images: [`${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`],
    },
    keywords: metadata.keywords,
  };
}

export default async function HomePage({params}: HomePageProps): Promise<React.JSX.Element> {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const tHome = await getTranslations({locale, namespace: "HomePage"});
  const pageUrl = `${SITE_URL}/${locale}`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HairSalon", "Barbershop"],
    "@id": `${SITE_URL}#localbusiness`,
    name: "Alicutz",
    category: "Barber Shop",
    description: tHome("metadata.description"),
    image: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
    url: pageUrl,
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phone,
    knowsLanguage: ["Turkish", "English", "German", "Persian", "Arabic", "Russian"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Şişli",
      streetAddress: "Osmanbey / Bomonti",
      addressRegion: "Istanbul",
      addressCountry: "TR",
    },
    areaServed: ["Istanbul", "Şişli", "Osmanbey", "Bomonti"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Barber Services",
      itemListElement: CORE_SERVICE_LABELS.map((serviceName, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: serviceName,
        },
      })),
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "22:00",
      },
    ],
    sameAs: [INSTAGRAM_LINK, GOOGLE_BUSINESS_LINK],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tHome("breadcrumbHome"),
        item: `${SITE_URL}/${locale}`,
      },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "Alicutz",
    url: pageUrl,
    logo: `${SITE_URL}/icon?size=512`,
    email: CONTACT_INFO.email,
    sameAs: [INSTAGRAM_LINK, GOOGLE_BUSINESS_LINK],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      contactType: "customer service",
      availableLanguage: ["tr", "en", "ar", "de", "fa", "ru"],
      areaServed: "TR",
      url: WHATSAPP_LINK,
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: "Alicutz",
    url: pageUrl,
    inLanguage: locale,
  };

  const imageObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${SITE_URL}#primary-image`,
    contentUrl: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
    url: `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    caption: tHome("metadata.imageAlt"),
    inLanguage: locale,
  };

  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    contactType: "customer service",
    areaServed: "TR",
    availableLanguage: ["tr", "en", "ar", "de", "fa", "ru"],
    url: WHATSAPP_LINK,
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: tHome("schema.serviceType"),
    provider: {
      "@type": "Barbershop",
      "@id": `${SITE_URL}#localbusiness`,
      name: "Alicutz",
      url: pageUrl,
    },
    areaServed: {
      "@type": "City",
      name: "Istanbul",
    },
    audience: {
      "@type": "Audience",
      audienceType: tHome("schema.audienceType"),
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: WHATSAPP_LINK,
      servicePhone: CONTACT_INFO.phone,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Core Barber Services",
      itemListElement: CORE_SERVICE_LABELS.map((serviceName, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: serviceName,
        },
      })),
    },
  };

  return (
    <main id="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(localBusinessSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(organizationSchema)}}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(contactPointSchema)}}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(imageObjectSchema)}}
      />

      <HeroSection />
      <LatestWorkSection />
      <ServicesSection />
      <AboutSection />
      <ReviewsSection />
      <LocationSection />
    </main>
  );
}
