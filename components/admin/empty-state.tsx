import {FileText} from "lucide-react";

import {AdminCard} from "@/components/admin/admin-card";

export interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({title, message}: EmptyStateProps): React.JSX.Element {
  return (
    <AdminCard className="py-12 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#171717]">
          <FileText className="h-5 w-5 text-[#a0a0a0]" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-medium text-[#f2f2f2]">{title}</h3>
        <p className="text-sm text-[#9a9a9a]">{message}</p>
      </div>
    </AdminCard>
  );
}
