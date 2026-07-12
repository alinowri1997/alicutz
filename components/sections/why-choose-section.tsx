import { BadgeCheck, ShieldCheck, Sparkles, Users, WandSparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const WHY_ICONS = [BadgeCheck, ShieldCheck, Sparkles, WandSparkles, Users] as const;
const WHY_KEYS = [
  "luxuryExperience",
  "medicalGradeHygiene",
  "skilledBarberTeam",
  "modernTechniques",
  "touristFriendly",
  "privateAppointmentFocus",
] as const;

export async function WhyChooseSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("WhyChoose");

  return (
    <Section id="about" spacing="md" tone="muted" aria-labelledby="why-heading">
      <div className="mx-auto mb-9 max-w-[68ch] text-center">
        <p className="type-caption text-accent">{t("eyebrow")}</p>
        <Heading as="h2" size="h2" id="why-heading" className="mt-4 text-balance">
          {t("title")}
        </Heading>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {WHY_KEYS.map((itemKey, index) => {
          const Icon = WHY_ICONS[index] ?? BadgeCheck;

          return (
            <div key={itemKey}>
              <article className="card-base card-outline h-full p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="type-h6 mt-4 text-text">{t(`items.${itemKey}.title`)}</h3>
                <p className="type-small mt-2 text-muted">{t(`items.${itemKey}.description`)}</p>
              </article>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
