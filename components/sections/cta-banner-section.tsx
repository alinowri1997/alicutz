import { Section } from "@/components/ui/section";

export function CtaBannerSection(): React.JSX.Element {
  return (
    <Section spacing="md" tone="surface" aria-label="Section divider">
      <div className="h-px w-full bg-border" />
    </Section>
  );
}
