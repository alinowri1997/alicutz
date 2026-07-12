import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

import { buttonVariants } from "@/components/ui/button";
import { GoogleMapPlaceholder } from "@/components/ui/google-map-placeholder";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { CONTACT_EMAIL_LINK, CONTACT_INFO, INSTAGRAM_LINK, WHATSAPP_LINK } from "@/constants/homepage";
import { cn } from "@/lib/utils";

export async function LocationSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Location");

  return (
    <Section id="contact" spacing="lg" tone="transparent" aria-labelledby="location-heading">
      <Heading as="h2" size="h3" id="location-heading" className="sr-only">
        {t("heading")}
      </Heading>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <GoogleMapPlaceholder title={t("mapTitle")} query="Osmanbey Bomonti Istanbul" />

        <div className="flex flex-col items-start gap-8">
          <p className="type-body max-w-[38ch] text-muted">{t("description")}</p>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-muted">
              <Clock3 className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="type-caption">{t("workingHours")}</p>
            </div>
            <p className="type-h5 text-text">{t("everyDay")}</p>
            <p className="type-h5 text-text">{t("hoursRange")}</p>
          </div>

          <div className="inline-flex items-center gap-2 text-text">
            <Phone className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="type-h5">{CONTACT_INFO.whatsapp}</p>
          </div>
          <Link
            href={CONTACT_EMAIL_LINK}
            className="group inline-flex items-center gap-2 type-small text-muted transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none focus-visible:text-accent"
          >
            <Mail className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
            {CONTACT_INFO.email}
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "group type-caption")}>
              <FaWhatsapp className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaBookNow")}</span>
            </Link>
            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "group type-caption")}>
              <FaWhatsapp className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaWhatsApp")}</span>
            </Link>
            <Link href={CONTACT_EMAIL_LINK} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "group type-caption")}>
              <Mail className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaEmail")}</span>
            </Link>
            <Link href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "group type-caption")}>
              <FaInstagram className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaInstagram")}</span>
            </Link>
            <Link href="https://maps.google.com/?q=Osmanbey+Bomonti+Istanbul" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "group type-caption")}>
              <MapPin className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaGetDirections")}</span>
            </Link>
            <Link href="tel:+905441772249" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "group type-caption")}>
              <Phone className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t("ctaCallNow")}</span>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
