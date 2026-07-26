"use client";

import * as React from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {DataTable, EmptyState, PageHeader, ConfirmDialog} from "@/components/admin";
import {createAdminId, DEFAULT_ADMIN_SERVICES, type AdminServiceRecord} from "@/lib/admin-dashboard";

export function ServicesClient(): React.JSX.Element {
  const [services, setServices] = React.useState<AdminServiceRecord[]>(DEFAULT_ADMIN_SERVICES);
  const [name, setName] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const createService = (): void => {
    if (!name.trim()) {
      return;
    }

    setServices((current) => [
      ...current,
      {id: createAdminId("service"), name: name.trim(), duration: duration.trim() || "45 min", active: true},
    ]);
    setName("");
    setDuration("");
  };

  const toggleService = (id: string): void => {
    setServices((current) => current.map((service) => (service.id === id ? {...service, active: !service.active} : service)));
  };

  const removeService = (id: string): void => {
    setServices((current) => current.filter((service) => service.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        section="Services"
        title="Service catalog"
        description="Manage the current service list locally. The state shape is intentionally simple so it can map directly to future CMS rows."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="type-caption text-muted">Create service</p>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="service-name">
                Name
              </label>
              <Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Skin Fade" />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="service-duration">
                Duration
              </label>
              <Input id="service-duration" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="45 min" />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="service-note">
                Notes
              </label>
              <Textarea id="service-note" placeholder="Optional internal note for this service" />
            </div>
            <Button variant="accent" size="md" onClick={createService}>
              Add service
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <DataTable
            columns={[
              {key: "name", label: "Service"},
              {key: "duration", label: "Duration"},
              {key: "status", label: "Status"},
              {key: "actions", label: "Actions", className: "w-[220px]"},
            ]}
            data={services}
            emptyTitle="No services configured"
            emptyDescription="Add the first service to start managing the catalog."
            renderRow={(service) => (
              <tr key={service.id}>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text">{service.name}</p>
                    <p className="type-small text-muted">Local draft record</p>
                  </div>
                </td>
                <td className="px-4 py-4 type-small text-muted">{service.duration}</td>
                <td className="px-4 py-4">
                  <Badge variant={service.active ? "default" : "outline"}>{service.active ? "Active" : "Hidden"}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => toggleService(service.id)}>
                      {service.active ? "Hide" : "Show"}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setConfirmId(service.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete service"
        description="This removes the service from local state. The structure is ready for a persistence layer later."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmId) {
            removeService(confirmId);
          }
          setConfirmId(null);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmId(null);
          }
        }}
      />

      {services.length === 0 ? <EmptyState title="Catalog empty" message="Add services to show the live catalog and ordering workflow." /> : null}
    </div>
  );
}
