import type * as React from "react";

import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export interface DataTableColumn {
  key: string;
  label: string;
  className?: string;
}

export interface DataTableProps<TItem> {
  columns: DataTableColumn[];
  data: TItem[];
  renderRow: (item: TItem, index: number) => React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  badge?: string;
}

export function DataTable<TItem>({
  columns,
  data,
  renderRow,
  emptyTitle,
  emptyDescription,
  badge,
}: DataTableProps<TItem>): React.JSX.Element {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        {badge ? <Badge variant="outline" className="mb-4">{badge}</Badge> : null}
        <h3 className="type-h5 text-text">{emptyTitle}</h3>
        <p className="type-small mt-2 text-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{data.map((item, index) => renderRow(item, index))}</TableBody>
    </Table>
  );
}
