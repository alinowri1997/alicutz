import * as React from "react";

import {cn} from "@/lib/utils";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminCard({
  className,
  title,
  subtitle,
  actions,
  children,
  ...props
}: AdminCardProps): React.JSX.Element {
  return (
    <article
      className={cn(
        "rounded-2xl border border-white/10 bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.28)]",
        className,
      )}
      {...props}
    >
      {title || subtitle || actions ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? <h3 className="text-sm font-medium tracking-wide text-[#f4f4f4]">{title}</h3> : null}
            {subtitle ? <p className="text-xs text-[#a5a5a5]">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </article>
  );
}
