import {
  Blend,
  Brush,
  Droplets,
  Palette,
  Scissors,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const SERVICE_ICONS = {
  haircut: Scissors,
  "skin-fade": Blend,
  "beard-styling": Brush,
  "hair-coloring": Palette,
  bleaching: Sparkles,
  "hair-treatment": Droplets,
  "kids-haircut": UserRound,
} as const;

const SERVICE_KEYS = [
  "haircut",
  "skinFade",
  "beardStyling",
  "hairColoring",
  "bleaching",
  "hairTreatment",
  "kidsHaircut",
] as const;

const SERVICE_ICON_MAP: Record<(typeof SERVICE_KEYS)[number], keyof typeof SERVICE_ICONS> = {
  haircut: "haircut",
  skinFade: "skin-fade",
  beardStyling: "beard-styling",
  hairColoring: "hair-coloring",
  bleaching: "bleaching",
  hairTreatment: "hair-treatment",
  kidsHaircut: "kids-haircut",
};

export async function ServicesSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Services");

  return (
    <Section id="services" spacing="lg" tone="transparent" aria-labelledby="services-heading">
      <div className="mb-12 space-y-4">
        <div className="space-y-4">
          <p className="type-caption text-accent">{t("eyebrow")}</p>
          <Heading as="h2" size="h2" id="services-heading" className="max-w-[24ch] text-balance">
            {t("title")}
          </Heading>
          <p className="type-body max-w-[60ch] text-muted">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICE_KEYS.map((serviceKey) => {
          const iconKey = SERVICE_ICON_MAP[serviceKey];
          const Icon = SERVICE_ICONS[iconKey] ?? Scissors;

          return (
            <div key={serviceKey}>
              <article className="card-base card-default h-full p-6 hover:-translate-y-1 hover:border-accent/60 hover:shadow-md">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="type-caption text-muted">{t("privateService")}</p>
                </div>

                <h3 className="type-h5 text-text">{t(`items.${serviceKey}.title`)}</h3>
                <p className="type-small mt-2 text-muted">{t(`items.${serviceKey}.description`)}</p>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <p className="type-caption text-accent">{t("consultationRequired")}</p>
                  <p className="type-caption text-muted">{t("privateSession")}</p>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
