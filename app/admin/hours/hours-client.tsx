"use client";

import * as React from "react";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {PageHeader, DataTable, StatsCard} from "@/components/admin";
import {DEFAULT_ADMIN_HOURS, type AdminWorkingDay} from "@/lib/admin-dashboard";

export function HoursClient(): React.JSX.Element {
  const [hours, setHours] = React.useState<AdminWorkingDay[]>(DEFAULT_ADMIN_HOURS);

  const updateDay = (id: string, key: keyof Pick<AdminWorkingDay, "open" | "close" | "breakDuration">, value: string): void => {
    setHours((current) => current.map((day) => (day.id === id ? {...day, [key]: value} : day)));
  };

  const enabledDays = hours.filter((day) => day.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        section="Hours"
        title="Working hours"
        description="Keep the schedule visible, editable, and easy to map to a future booking backend."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Enabled days" value={String(enabledDays)} detail="Live working-day switches" />
        <StatsCard label="Opening window" value="09:00" detail="Default opening time" />
        <StatsCard label="Closing window" value="22:00" detail="Default closing time" />
        <StatsCard label="Buffer" value="15 min" detail="Default inter-appointment break" />
      </section>

      <DataTable
        columns={[
          {key: "day", label: "Day"},
          {key: "open", label: "Open"},
          {key: "close", label: "Close"},
          {key: "break", label: "Break"},
          {key: "status", label: "Status"},
        ]}
        data={hours}
        emptyTitle="No schedule rows"
        emptyDescription="There are no working-hour records in local state."
        renderRow={(day) => (
          <tr key={day.id}>
            <td className="px-4 py-4">
              <div>
                <p className="text-sm font-medium text-text">{day.day}</p>
                <p className="type-small text-muted">Weekly configuration</p>
              </div>
            </td>
            <td className="px-4 py-4">
              <Input value={day.open} onChange={(event) => updateDay(day.id, "open", event.target.value)} className="max-w-28" />
            </td>
            <td className="px-4 py-4">
              <Input value={day.close} onChange={(event) => updateDay(day.id, "close", event.target.value)} className="max-w-28" />
            </td>
            <td className="px-4 py-4">
              <Input value={day.breakDuration} onChange={(event) => updateDay(day.id, "breakDuration", event.target.value)} className="max-w-28" />
            </td>
            <td className="px-4 py-4">
              <Switch
                checked={day.enabled}
                onCheckedChange={(checked) =>
                  setHours((current) => current.map((item) => (item.id === day.id ? {...item, enabled: checked} : item)))
                }
              />
            </td>
          </tr>
        )}
      />
    </div>
  );
}
