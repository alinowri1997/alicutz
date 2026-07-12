import Link from "next/link";
import { Clock3 } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              <p className="type-caption">{t("workingHours")}</p>
            </div>
            <p className="type-h5 text-text">{t("everyDay")}</p>
            <p className="type-h5 text-text">{t("hoursRange")}</p>
          </div>

          <p className="type-h5 text-text">{CONTACT_INFO.whatsapp}</p>
          <Link
            href={CONTACT_EMAIL_LINK}
            className="type-small text-muted transition-colors duration-[var(--duration-fast)] hover:text-text focus-visible:outline-none focus-visible:text-accent"
          >
            {CONTACT_INFO.email}
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "type-caption")}>{t("ctaBookNow")}</Link>
            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "type-caption")}>{t("ctaWhatsApp")}</Link>
            <Link href={CONTACT_EMAIL_LINK} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "type-caption")}>Email</Link>
            <Link href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "type-caption")}>{t("ctaInstagram")}</Link>
            <Link href="https://maps.google.com/?q=Osmanbey+Bomonti+Istanbul" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "type-caption")}>{t("ctaGetDirections")}</Link>
            <Link href="tel:+905441772249" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "type-caption")}>{t("ctaCallNow")}</Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
