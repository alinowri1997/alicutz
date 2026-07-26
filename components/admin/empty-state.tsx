import {FileText} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({title, message, action}: EmptyStateProps): React.JSX.Element {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
          <FileText className="h-5 w-5 text-[#a0a0a0]" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-[42ch]">{message}</CardDescription>
      </CardHeader>
      {action ? <CardContent className="flex justify-center pt-0">{action}</CardContent> : null}
    </Card>
  );
}
