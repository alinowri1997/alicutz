import { getTranslations } from "next-intl/server";

import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

const STAT_KEYS = ["serviceArea", "languages"] as const;

export async function StatisticsSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Statistics");

  return (
    <Section id="trust" spacing="sm" tone="surface" aria-labelledby="trust-heading">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-end">
        <div className="space-y-4">
          <p className="type-caption text-text">{t("eyebrow")}</p>
          <Heading as="h2" size="h2" id="trust-heading" className="max-w-[22ch] text-balance">
            {t("title")}
          </Heading>
          <p className="type-body max-w-[56ch] text-muted">
            {t("description")}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2" aria-label={t("listAria")}>
          {STAT_KEYS.map((key) => (
            <li
              key={key}
              className="card-base card-default flex min-h-[148px] flex-col justify-between p-5"
            >
              <p className="type-caption text-muted">{t(`items.${key}.label`)}</p>
              <p className="type-h2 text-text">{t(`items.${key}.value`)}</p>
              <p className="type-small text-muted">{t(`items.${key}.detail`)}</p>
            </li>
          ))}
        </ul>
      </div>

    </Section>
  );
}
