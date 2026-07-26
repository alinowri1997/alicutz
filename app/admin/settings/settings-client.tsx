"use client";

import * as React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {PageHeader, StatsCard} from "@/components/admin";
import {DEFAULT_ADMIN_SETTINGS, type AdminBusinessSettings} from "@/lib/admin-dashboard";

export function SettingsClient(): React.JSX.Element {
  const [settings, setSettings] = React.useState<AdminBusinessSettings>(DEFAULT_ADMIN_SETTINGS);
  const [saved, setSaved] = React.useState(false);

  const updateSetting = (key: keyof AdminBusinessSettings, value: string): void => {
    setSettings((current) => ({...current, [key]: value}));
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        section="Settings"
        title="Business settings"
        description="Store the public-facing admin settings in one place. This is intentionally local state so a future persistence layer can plug in cleanly."
        actions={
          <Button variant="accent" size="md" onClick={() => setSaved(true)}>
            Save settings
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Language" value={settings.defaultLanguage.toUpperCase()} detail="Default public locale" />
        <StatsCard label="WhatsApp" value="Active" detail="Primary booking channel" />
        <StatsCard label="Maps" value="Shared after booking" detail="Exact location not public" />
        <StatsCard label="Sync" value={saved ? "Saved" : "Draft"} detail="Local changes only" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="type-caption text-muted" htmlFor="settings-whatsapp">
                WhatsApp
              </label>
              <Input id="settings-whatsapp" value={settings.whatsapp} onChange={(event) => updateSetting("whatsapp", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="settings-instagram">
                Instagram
              </label>
              <Input id="settings-instagram" value={settings.instagram} onChange={(event) => updateSetting("instagram", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="settings-phone">
                Phone
              </label>
              <Input id="settings-phone" value={settings.phone} onChange={(event) => updateSetting("phone", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="settings-email">
                Email
              </label>
              <Input id="settings-email" value={settings.email} onChange={(event) => updateSetting("email", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="type-caption text-muted" htmlFor="settings-language">
                Default language
              </label>
              <Input id="settings-language" value={settings.defaultLanguage} onChange={(event) => updateSetting("defaultLanguage", event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="type-caption text-muted" htmlFor="settings-maps">
                Location note
              </label>
              <Textarea
                id="settings-maps"
                value={settings.googleMaps}
                onChange={(event) => updateSetting("googleMaps", event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <p className="type-caption text-muted">Preview</p>
          <div className="space-y-2 text-sm text-muted">
            <p>WhatsApp: {settings.whatsapp}</p>
            <p>Instagram: {settings.instagram}</p>
            <p>Phone: {settings.phone}</p>
            <p>Email: {settings.email}</p>
            <p>Language: {settings.defaultLanguage}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="type-small text-muted">
              The admin design keeps the business rules visible: WhatsApp-first conversion, no public exact location, and an upscale private-service tone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
