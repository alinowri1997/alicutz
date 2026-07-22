import {UploadCloud} from "lucide-react";

import {AdminCard} from "@/components/admin/admin-card";

export interface UploadCardProps {
  title: string;
  description: string;
  buttonLabel: string;
}

export function UploadCard({title, description, buttonLabel}: UploadCardProps): React.JSX.Element {
  return (
    <AdminCard title={title} subtitle={description}>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-[#161616] px-4 text-xs font-medium text-[#ececec] transition-colors hover:bg-[#1b1b1b]"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {buttonLabel}
      </button>
    </AdminCard>
  );
}
