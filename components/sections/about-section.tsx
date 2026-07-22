import {getTranslations} from "next-intl/server";

import {Heading} from "@/components/ui/heading";
import {Section} from "@/components/ui/section";

const ABOUT_KEYS = ["serviceArea", "languages"] as const;

export async function AboutSection(): Promise<React.JSX.Element> {
  const t = await getTranslations("Statistics");

  return (
    <Section id="about" spacing="lg" tone="surface" aria-labelledby="about-heading">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="space-y-4">
          <p className="type-caption text-muted">About</p>
          <Heading as="h2" size="h2" id="about-heading" className="max-w-[22ch] text-balance text-text">
            {t("title")}
          </Heading>
          <p className="type-small max-w-[50ch] text-muted">{t("description")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2" aria-label={t("listAria")}>
          {ABOUT_KEYS.map((key) => (
            <article key={key} className="rounded-xl border border-border bg-background p-6 transition-colors duration-300 hover:border-white/20">
              <p className="type-caption text-muted">{t(`items.${key}.label`)}</p>
              <p className="type-h3 mt-3 text-text">{t(`items.${key}.value`)}</p>
              <p className="type-small mt-2 text-muted">{t(`items.${key}.detail`)}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
