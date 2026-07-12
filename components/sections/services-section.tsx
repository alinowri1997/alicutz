import { getTranslations } from "next-intl/server";

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
          return (
            <div key={serviceKey}>
              <article className="card-base card-default flex h-full flex-col p-6 hover:-translate-y-1 hover:border-accent/60 hover:shadow-md">
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
