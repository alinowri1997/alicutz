import {ChevronRight} from "lucide-react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  section: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({title, section, description, actions, className}: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Admin</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{section}</span>
        </div>
        <div className="space-y-1">
          <h1 className="type-h2 text-text">{title}</h1>
          {description ? <p className="type-small max-w-[64ch] text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : <Button variant="secondary" size="sm">Quick Create</Button>}
    </div>
  );
}
