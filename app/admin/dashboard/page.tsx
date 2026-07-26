import {Button} from "@/components/ui/button";
import {PageHeader, StatsCard, EmptyState} from "@/components/admin";
import {buildDashboardMetrics, DEFAULT_ADMIN_GALLERY, DEFAULT_ADMIN_HOURS, DEFAULT_ADMIN_SERVICES, DEFAULT_ADMIN_SETTINGS} from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage(): React.JSX.Element {
  const metrics = buildDashboardMetrics(DEFAULT_ADMIN_SERVICES, DEFAULT_ADMIN_HOURS, DEFAULT_ADMIN_GALLERY, DEFAULT_ADMIN_SETTINGS);

  return (
    <div className="space-y-6">
      <PageHeader
        section="Dashboard"
        title="Operations at a glance"
        description="Track the active service set, opening hours, gallery priorities, and core business settings from one protected workspace."
        actions={<Button variant="accent" size="md">Message on WhatsApp</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
        {metrics.map((metric) => (
          <StatsCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <EmptyState
          title="Workflow ready"
          message="The admin shell is route-based, keyboard accessible, and prepared for a future Supabase data source without changing the page structure."
        />
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="type-caption text-muted">Next steps</p>
          <h2 className="mt-2 type-h4 text-text">Keep the source of truth local for now</h2>
          <p className="mt-3 type-small text-muted">
            Services, hours, gallery, and settings are stored in local component state so the integration surface stays clean when Supabase is added.
          </p>
        </div>
      </section>
    </div>
  );
}