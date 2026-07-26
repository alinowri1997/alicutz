import * as React from "react";

import {cn} from "@/lib/utils";

export function Table({className, ...props}: React.TableHTMLAttributes<HTMLTableElement>): React.JSX.Element {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <thead className={cn("bg-background/50 text-muted", className)} {...props} />;
}

export function TableBody({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>): React.JSX.Element {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableRow({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>): React.JSX.Element {
  return <tr className={cn("transition-colors hover:bg-background/60", className)} {...props} />;
}

export function TableHead({className, ...props}: React.ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return <th className={cn("px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.12em]", className)} {...props} />;
}

export function TableCell({className, ...props}: React.TdHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return <td className={cn("px-4 py-4 align-top text-text", className)} {...props} />;
}
