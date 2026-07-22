import { getTranslations } from "next-intl/server";
import {
  Blend,
  Scissors,
  Sparkles,
  UserRound,
  Waves,
  PaintbrushVertical,
  Baby,
} from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const SERVICE_KEYS = [
  "haircut",
  "skinFade",
  "beardStyling",
  "hairColoring",
  "kidsHaircut",
  "hairTherapy",
  "facialTherapy",
] as const;

const SERVICE_ICONS = {
  haircut: Scissors,
  skinFade: Blend,
  beardStyling: UserRound,
  hairColoring: PaintbrushVertical,
  kidsHaircut: Baby,
  hairTherapy: Waves,
  facialTherapy: Sparkles,
} as const;

export async function ServicesSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Services");

  return (
    <Section id="services" spacing="lg" tone="transparent" aria-labelledby="services-heading">
      <div className="mb-12 space-y-4">
        <div className="space-y-4">
          <p className="type-caption text-muted">{t("eyebrow")}</p>
          <Heading as="h2" size="h2" id="services-heading" className="max-w-[24ch] text-balance">
            {t("title")}
          </Heading>
          <p className="type-body max-w-[60ch] text-muted">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICE_KEYS.map((serviceKey) => {
          const Icon = SERVICE_ICONS[serviceKey];

          return (
            <div key={serviceKey}>
              <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:border-white/25 hover:bg-black/85">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/80 text-muted">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="type-h5 text-text">{t(`items.${serviceKey}.title`)}</h3>
                <p className="type-small mt-3 flex-1 text-muted">{t(`items.${serviceKey}.description`)}</p>
              </article>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
