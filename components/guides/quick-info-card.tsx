import type {GuideQuickFacts} from "@/lib/guides";

interface QuickInfoCardProps {
  quickFacts?: GuideQuickFacts;
}

function toInfoRows(quickFacts?: GuideQuickFacts): Array<{label: string; value: string}> {
  if (!quickFacts) {
    return [];
  }

  const rows: Array<{label: string; value: string}> = [];

  if (quickFacts.appointmentDuration) {
    rows.push({label: "Appointment duration", value: quickFacts.appointmentDuration});
  }

  if (quickFacts.languages && quickFacts.languages.length > 0) {
    rows.push({label: "Languages", value: quickFacts.languages.join(" | ")});
  }

  if (quickFacts.bestFor) {
    rows.push({label: "Best for", value: quickFacts.bestFor});
  }

  if (quickFacts.location) {
    rows.push({label: "Location", value: quickFacts.location});
  }

  if (quickFacts.appointmentRequired) {
    rows.push({label: "Appointment", value: quickFacts.appointmentRequired});
  }

  return rows;
}

export function QuickInfoCard({quickFacts}: QuickInfoCardProps): React.JSX.Element | null {
  const rows = toInfoRows(quickFacts);

  if (rows.length === 0) {
    return null;
  }

  return (
    <aside className="rounded-2xl border border-border bg-surface p-5">
      <p className="type-caption text-muted">Quick Info</p>
      <dl className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="type-caption text-muted">{row.label}</dt>
            <dd className="type-small text-text">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
