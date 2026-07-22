"use client";

import {AdminCard, SectionContainer, StatsCard} from "@/components/admin";

const DASHBOARD_STATS = [
  {label: "Hero Status", value: "Live", detail: "Draft + publish enabled"},
  {label: "Gallery Images", value: "Firebase", detail: "Storage-backed assets"},
  {label: "Reviews", value: "Moderated", detail: "Approve/hide workflow"},
  {label: "Services", value: "Sortable", detail: "Drag & drop ordering"},
  {label: "Storage", value: "Media Library", detail: "Reusable multi-folder setup"},
  {label: "Quick Actions", value: "Live Preview", detail: "No page refresh edits"},
] as const;

export function DashboardHome(): React.JSX.Element {
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
        <AdminCard>
          <p className="text-sm text-[#9a9a9a]">
            Use the sidebar to manage Hero, Featured Cuts, Services, Reviews, Contact, Site Settings, and reusable media.
          </p>
        </AdminCard>
      </SectionContainer>
    </>
  );
}
