import * as React from "react";

import {cn} from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({className, ...props}: CardProps): React.JSX.Element {
  return <div className={cn("rounded-2xl border border-border bg-surface text-text shadow-[0_18px_45px_rgba(0,0,0,0.32)]", className)} {...props} />;
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({className, ...props}: CardHeaderProps): React.JSX.Element {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({className, ...props}: CardTitleProps): React.JSX.Element {
  return <h3 className={cn("type-h5 text-text", className)} {...props} />;
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({className, ...props}: CardDescriptionProps): React.JSX.Element {
  return <p className={cn("type-small text-muted", className)} {...props} />;
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({className, ...props}: CardContentProps): React.JSX.Element {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
