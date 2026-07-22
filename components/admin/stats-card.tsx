import {ArrowUpRight} from "lucide-react";

import {AdminCard} from "@/components/admin/admin-card";

export interface StatsCardProps {
  label: string;
  value: string;
  detail: string;
}

export function StatsCard({label, value, detail}: StatsCardProps): React.JSX.Element {
  return (
    <AdminCard className="h-full" title={label}>
      <div className="space-y-2">
        <p className="text-3xl font-semibold text-[#f5f5f5]">{value}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#9a9a9a]">{detail}</p>
          <ArrowUpRight className="h-4 w-4 text-[#8a8a8a]" aria-hidden="true" />
        </div>
      </div>
    </AdminCard>
  );
}
