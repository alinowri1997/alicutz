"use client";

import {AdminCard, SectionContainer, StatsCard} from "@/components/admin";
import {useAdminActivity} from "@/hooks/use-admin-activity";
import {useSiteHealth} from "@/hooks/use-site-health";

const DASHBOARD_STATS = [
  {label: "Hero Status", value: "Live", detail: "Draft + publish enabled"},
  {label: "Gallery Images", value: "Firebase", detail: "Storage-backed assets"},
  {label: "Reviews", value: "Moderated", detail: "Approve/hide workflow"},
  {label: "Services", value: "Sortable", detail: "Drag & drop ordering"},
  {label: "Storage", value: "Media Library", detail: "Reusable multi-folder setup"},
  {label: "Quick Actions", value: "Live Preview", detail: "No page refresh edits"},
] as const;

export function DashboardHome(): React.JSX.Element {
  const {items: activity} = useAdminActivity(6);
  const {items: healthChecks} = useSiteHealth();
  const warnings = healthChecks.filter((item) => item.status === "warning");

  return (
    <>
      <SectionContainer title="Dashboard" description="Firebase-connected content operations and publishing workflow.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_STATS.map((stat) => (
            <StatsCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer title="Status" description="Admin modules are now connected to Firestore and Storage.">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminCard title="Recent Activity" subtitle="Latest admin actions">
            <div className="space-y-2">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-[#141414] p-3">
                  <p className="text-sm text-[#efefef]">{item.action}</p>
                  <p className="text-xs text-[#8d8d8d]">{item.targetSection || item.targetType}</p>
                </div>
              ))}
              {activity.length === 0 ? <p className="text-sm text-[#9a9a9a]">No activity yet.</p> : null}
            </div>
          </AdminCard>

          <AdminCard title="Website Status" subtitle="Automated health checks">
            <div className="space-y-2">
              <p className="text-sm text-[#efefef]">
                {warnings.length === 0 ? "All core checks are healthy." : `${warnings.length} warning(s) detected.`}
              </p>
              {warnings.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-[#141414] p-3">
                  <p className="text-sm text-[#efefef]">{item.title}</p>
                  <p className="text-xs text-[#8d8d8d]">{item.message}</p>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </SectionContainer>
    </>
  );
}
