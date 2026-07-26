import {ArrowUpRight} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export interface StatsCardProps {
  label: string;
  value: string;
  detail: string;
}

export function StatsCard({label, value, detail}: StatsCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="type-h3">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="type-small text-muted">{detail}</p>
          <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
