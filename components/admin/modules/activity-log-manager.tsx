"use client";

import {AdminCard, SectionContainer} from "@/components/admin";
import {useAdminActivity} from "@/hooks/use-admin-activity";

export function ActivityLogManager(): React.JSX.Element {
  const {items, isLoading, refresh} = useAdminActivity(100);

  return (
    <SectionContainer title="Activity Log" description="Track logins, content updates, uploads, deletes, and publishes.">
      <AdminCard title="Recent Activity" actions={<button type="button" onClick={() => void refresh()} className="text-xs text-[#cfcfcf]">Refresh</button>}>
        <div className="space-y-2">
          {isLoading ? <p className="text-sm text-[#9a9a9a]">Loading...</p> : null}
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-[#141414] p-3">
              <p className="text-sm text-[#efefef]">{item.action}</p>
              <p className="text-xs text-[#9a9a9a]">
                {item.targetType}{item.targetSection ? ` • ${item.targetSection}` : ""}{item.targetId ? ` • ${item.targetId}` : ""}
              </p>
              <p className="text-xs text-[#808080]">{item.actorEmail || item.actorUid}</p>
            </div>
          ))}
          {!isLoading && items.length === 0 ? <p className="text-sm text-[#9a9a9a]">No activity records yet.</p> : null}
        </div>
      </AdminCard>
    </SectionContainer>
  );
}
