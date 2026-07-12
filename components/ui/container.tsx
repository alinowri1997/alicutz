import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      sm: "max-w-[var(--container-sm)]",
      md: "max-w-[var(--container-md)]",
      lg: "max-w-[var(--container-lg)]",
      xl: "max-w-[var(--container-xl)]",
      full: "max-w-none",
    },
    gutters: {
      true: "px-4 sm:px-6 lg:px-8",
      false: "px-0",
    },
  },
  defaultVariants: {
    size: "xl",
    gutters: true,
  },
});

type ContainerElement = keyof Pick<
  React.JSX.IntrinsicElements,
  "div" | "section" | "article" | "main"
>;

export interface ContainerProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof containerVariants> {
  as?: ContainerElement;
}

export function Container({
  as: Component = "div",
  className,
  size,
  gutters,
  ...props
}: ContainerProps): React.JSX.Element {
  return <Component className={cn(containerVariants({ size, gutters }), className)} {...props} />;
}
