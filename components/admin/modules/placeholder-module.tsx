"use client";

import {EmptyState, SectionContainer} from "@/components/admin";

export function PlaceholderModule({title}: {title: string}): React.JSX.Element {
  return (
    <SectionContainer title={title} description="Module structure is ready for additional integrations.">
      <EmptyState
        title={`${title} module ready`}
        message="This area is connected to the dashboard shell and can be expanded in next milestones."
      />
    </SectionContainer>
  );
}
