import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { WHATSAPP_LINK } from "@/constants/homepage";

export async function HeroSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Hero");

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-28 md:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background" />

      <Container className="grid gap-8 md:min-h-[calc(100svh-5rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16">
        <div className="space-y-6 sm:space-y-7 md:space-y-8">
          <p className="type-caption text-muted" aria-label={t("locationPositioningAria")}>
            {t("eyebrow")}
          </p>

          <Heading
            id="hero-heading"
            as="h1"
            size="display"
            className="max-w-[15ch] text-balance text-text"
          >
            {t("title")}
          </Heading>

          <p className="type-body max-w-[56ch] text-muted">
            {t("description")}
          </p>

          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="type-small inline-flex min-h-11 items-center rounded-full border border-border px-6 py-3 text-text transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Book Appointment
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="relative h-[70vh] min-h-[520px] rounded-2xl border border-border bg-primary/70">
            <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
            <p className="type-caption absolute bottom-6 left-6 text-muted">Cinematic video placeholder</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
