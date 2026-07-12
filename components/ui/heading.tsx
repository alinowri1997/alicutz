import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const headingVariants = cva("text-text", {
  variants: {
    size: {
      display: "type-display",
      h1: "type-h1",
      h2: "type-h2",
      h3: "type-h3",
      h4: "type-h4",
      h5: "type-h5",
      h6: "type-h6",
    },
    tone: {
      default: "text-text",
      muted: "text-muted",
      accent: "text-accent",
    },
    balance: {
      true: "text-balance",
      false: "",
    },
  },
  defaultVariants: {
    size: "h2",
    tone: "default",
    balance: true,
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function Heading({
  as,
  className,
  size,
  tone,
  balance,
  ...props
}: HeadingProps): React.JSX.Element {
  const tag = as ?? "h2";

  return React.createElement(tag, {
    className: cn(headingVariants({ size, tone, balance }), className),
    ...props,
  });
}
