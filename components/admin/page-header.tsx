import {ChevronRight} from "lucide-react";

export interface PageHeaderProps {
  title: string;
  section: string;
}

export function PageHeader({title, section}: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/10 bg-[#101010] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.26)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <span>Admin</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{section}</span>
        </div>
        <h1 className="text-xl font-semibold text-[#f5f5f5] md:text-2xl">{title}</h1>
      </div>
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-[#161616] px-4 text-xs font-medium text-[#efefef]"
      >
        Quick Create
      </button>
    </div>
  );
}
