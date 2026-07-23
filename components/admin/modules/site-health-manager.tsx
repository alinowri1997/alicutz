"use client";

import {AlertTriangle, CheckCircle2} from "lucide-react";

import {AdminCard, SectionContainer} from "@/components/admin";
import {useSiteHealth} from "@/hooks/use-site-health";

export function SiteHealthManager(): React.JSX.Element {
  const {items, isLoading, refresh} = useSiteHealth();

  return (
    <SectionContainer title="Site Health" description="Automated checks for content completeness and critical website config.">
      <AdminCard title="Health Checks" actions={<button type="button" onClick={() => void refresh()} className="text-xs text-[#cfcfcf]">Refresh</button>}>
        <div className="space-y-2">
          {isLoading ? <p className="text-sm text-[#9a9a9a]">Running checks...</p> : null}
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#141414] p-3">
              {item.status === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm text-[#efefef]">{item.title}</p>
                <p className="text-xs text-[#9a9a9a]">{item.message}</p>
              </div>
            </div>
          ))}
          {!isLoading && items.length === 0 ? <p className="text-sm text-[#9a9a9a]">No checks available.</p> : null}
        </div>
      </AdminCard>
    </SectionContainer>
  );
}
