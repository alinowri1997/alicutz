import {Scissors} from "lucide-react";

interface BarbersAdviceNoteProps {
  note: string;
}

export function BarbersAdviceNote({note}: BarbersAdviceNoteProps): React.JSX.Element {
  return (
    <section className="mt-16 rounded-2xl border border-border/80 bg-surface/70 p-6">
      <p className="type-caption inline-flex items-center gap-2 text-muted">
        <Scissors className="h-4 w-4" aria-hidden="true" />
        Barber&apos;s Advice
      </p>
      <p className="type-body mt-4 max-w-[65ch] text-text">{note}</p>
    </section>
  );
}
