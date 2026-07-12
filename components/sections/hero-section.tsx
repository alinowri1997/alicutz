import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { HeroLanguageSwitcher } from "@/components/sections/hero-language-switcher";
import { HeroPortfolioShowcase } from "@/components/sections/hero-portfolio-showcase";

export async function HeroSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Hero");

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pt-24 pb-16 sm:pt-28 md:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary via-secondary to-background" />

      <Container className="grid gap-6 md:min-h-[calc(100svh-5rem)] md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14">
        <div className="space-y-4 sm:space-y-6 md:space-y-7">
          <span id="portfolio" className="sr-only" />

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

          <div className="md:hidden -mt-1">
            <HeroPortfolioShowcase />
          </div>

          <HeroLanguageSwitcher />

          <div className="max-w-sm rounded-lg border border-border bg-surface px-4 py-3">
            <p className="type-caption text-muted">{t("serviceModelLabel")}</p>
            <p className="type-small mt-1 text-text">{t("serviceModelValue")}</p>
          </div>

          <Link
            href="#services"
            className="type-small inline-flex items-center gap-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
          >
            {t("exploreServices")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative hidden md:block">
          <HeroPortfolioShowcase />
        </div>
      </Container>
    </section>
  );
}
