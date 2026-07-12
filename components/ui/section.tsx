import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const sectionVariants = cva("w-full", {
  variants: {
    spacing: {
      none: "py-0",
      sm: "py-10 md:py-12",
      md: "py-14 md:py-20",
      lg: "py-20 md:py-28",
    },
    tone: {
      background: "bg-background text-text",
      surface: "bg-surface text-text",
      muted: "bg-[color-mix(in_srgb,var(--color-background)_80%,var(--color-secondary)_20%)] text-text",
      transparent: "bg-transparent text-text",
    },
  },
  defaultVariants: {
    spacing: "md",
    tone: "transparent",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  container?: boolean;
  containerSize?: React.ComponentProps<typeof Container>["size"];
}

export function Section({
  className,
  spacing,
  tone,
  container = true,
  containerSize = "xl",
  children,
  ...props
}: SectionProps): React.JSX.Element {
  return (
    <section className={cn(sectionVariants({ spacing, tone }), className)} {...props}>
      {container ? <Container size={containerSize}>{children}</Container> : children}
    </section>
  );
}
