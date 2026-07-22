import * as React from "react";

import {cn} from "@/lib/utils";

export interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function SectionContainer({
  title,
  description,
  className,
  children,
  ...props
}: SectionContainerProps): React.JSX.Element {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-[#f2f2f2]">{title}</h2>
        {description ? <p className="text-sm text-[#9a9a9a]">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
