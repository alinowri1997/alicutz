"use client";

import * as React from "react";
import {DayPicker} from "react-day-picker";

import {cn} from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({className, classNames, showOutsideDays = true, ...props}: CalendarProps): React.JSX.Element {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "p-3",
        months: "flex flex-col gap-4 sm:flex-row sm:gap-3",
        month: "space-y-4",
        month_caption: "flex items-center justify-between px-1 pb-2",
        caption_label: "type-small font-medium text-text",
        nav: "flex items-center gap-1",
        button_previous: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text",
        button_next: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-xs uppercase tracking-[0.08em] text-muted",
        week: "mt-1 flex w-full",
        day: "relative h-9 w-9 p-0 text-center",
        day_button: "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm text-text transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected: "bg-accent text-accent-foreground hover:bg-accent focus:bg-accent",
        today: "border border-accent/30",
        outside: "text-muted/50",
        disabled: "pointer-events-none text-muted/40",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
