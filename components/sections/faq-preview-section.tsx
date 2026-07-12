import { getTranslations } from "next-intl/server";

import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const FAQ_KEYS = [
  "booking",
  "languages",
  "privateAppointments",
  "salonLocation",
  "specialties",
  "realWork",
] as const;

export async function FaqPreviewSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Faq");

  return (
    <Section id="faq" spacing="md" tone="transparent" aria-labelledby="faq-heading">
      <div className="mb-10 space-y-4">
        <div className="space-y-4">
          <p className="type-caption text-accent">{t("eyebrow")}</p>
          <Heading as="h2" size="h2" id="faq-heading" className="max-w-[24ch] text-balance">
            {t("title")}
          </Heading>
        </div>
      </div>

      <div className="grid gap-4">
        {FAQ_KEYS.map((faqKey) => (
          <div key={faqKey}>
            <details className="group rounded-xl border border-border bg-surface p-5 open:border-accent/60">
              <summary className="type-small cursor-pointer list-none pr-8 text-text focus-visible:outline-none">
                {t(`items.${faqKey}.question`)}
              </summary>
              <p className="type-small mt-3 text-muted">{t(`items.${faqKey}.answer`)}</p>
            </details>
          </div>
        ))}
      </div>
    </Section>
  );
}
