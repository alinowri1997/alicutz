import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";

import {
  FaqPreviewSection,
  HeroSection,
  HomeFooterSection,
  LocationSection,
  ServicesSection,
  StatisticsSection,
  WhyChooseSection,
} from "@/components/sections";
import {CONTACT_INFO, INSTAGRAM_LINK, WHATSAPP_LINK} from "@/constants/homepage";
import {buildLanguageAlternates, SITE_URL} from "@/lib/seo";
import {defaultLocale, routing} from "@/i18n/routing";

interface HomePageProps {
  params: Promise<{locale: string}>;
}

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  const {locale: rawLocale} = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({locale, namespace: "HomePage"});
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
      images: [
        {
          url: `${SITE_URL}/images/hero-signature.svg`,
          width: 1600,
          height: 2000,
          alt: metadata.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.twitterTitle,
      description: metadata.twitterDescription,
      images: [`${SITE_URL}/images/hero-signature.svg`],
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

  const tFaq = await getTranslations({locale, namespace: "Faq"});
  const tHome = await getTranslations({locale, namespace: "HomePage"});

  const faqKeys = [
    "booking",
    "languages",
    "privateAppointments",
    "salonLocation",
    "specialties",
    "realWork",
  ] as const;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HairSalon", "Barbershop"],
    name: "Ali Cutz",
    image: `${SITE_URL}/images/hero-signature.svg`,
    url: `${SITE_URL}/${locale}`,
    email: CONTACT_INFO.email,
    telephone: CONTACT_INFO.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Osmanbey / Bomonti",
      addressRegion: "Istanbul",
      addressCountry: "TR",
    },
    areaServed: ["Istanbul", "Osmanbey", "Bomonti"],
    sameAs: [INSTAGRAM_LINK, WHATSAPP_LINK],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqKeys.map((faqKey) => ({
      "@type": "Question",
      name: tFaq(`items.${faqKey}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: tFaq(`items.${faqKey}.answer`),
      },
    })),
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
    name: "Ali Cutz",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/images/hero-signature.svg`,
    email: CONTACT_INFO.email,
    sameAs: [INSTAGRAM_LINK, WHATSAPP_LINK],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      contactType: "customer service",
      availableLanguage: ["English", "Turkish", "German", "Arabic", "Persian", "Russian"],
      areaServed: "TR",
      url: WHATSAPP_LINK,
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ali Cutz",
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
  };

  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    contactType: "customer service",
    areaServed: "TR",
    availableLanguage: ["English", "Turkish", "German", "Arabic", "Persian", "Russian"],
    url: WHATSAPP_LINK,
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Private premium barber appointment",
    provider: {
      "@type": "Barbershop",
      name: "Ali Cutz",
      url: `${SITE_URL}/${locale}`,
    },
    areaServed: {
      "@type": "City",
      name: "Istanbul",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Hotel guests, tourists, business travelers, and residents",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: WHATSAPP_LINK,
      servicePhone: CONTACT_INFO.phone,
    },
  };

  return (
    <main id="home">
      <div id="main-content" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(localBusinessSchema)}}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
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

      <HeroSection />
      <StatisticsSection />
      <ServicesSection />
      <WhyChooseSection />
      <FaqPreviewSection />
      <LocationSection />
      <HomeFooterSection />
    </main>
  );
}
