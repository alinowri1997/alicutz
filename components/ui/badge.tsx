import * as React from "react";

import {cn} from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-transparent bg-accent text-accent-foreground",
  secondary: "border-border bg-surface text-text",
  outline: "border-border bg-transparent text-muted",
};

export function Badge({className, variant = "default", ...props}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] uppercase",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
