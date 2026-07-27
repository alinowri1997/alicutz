"use client";

import * as React from "react";
import Link from "next/link";
import {LayoutDashboard, LucideIcon, Settings, Store, Images, Clock3, LogOut, X, MessageSquare} from "lucide-react";
import {usePathname} from "next/navigation";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {ADMIN_NAV_ITEMS, type AdminNavKey} from "@/lib/admin-dashboard";

const NAV_ICONS: Record<AdminNavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  reviews: MessageSquare,
  services: Store,
  hours: Clock3,
  gallery: Images,
  settings: Settings,
};

const NAV_COPY: Record<AdminNavKey, string> = {
  dashboard: "Overview",
  reviews: "Reviews",
  services: "Services",
  hours: "Hours",
  gallery: "Gallery",
  settings: "Settings",
};

export interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function getActiveKey(pathname: string): AdminNavKey {
  const match = ADMIN_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.key ?? "dashboard";
}

export function AdminSidebar({open, onClose, onLogout}: AdminSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const activeKey = getActiveKey(pathname);

  return (
    <>
      <button
        type="button"
        aria-label="Close admin navigation"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r border-border bg-[#090909] px-4 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.52)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="type-caption text-muted">Ali Cutz</p>
            <p className="type-h6 text-text">Admin Console</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-1" aria-label="Admin navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const isActive = item.key === activeKey;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors duration-200",
                  isActive
                    ? "border-accent/30 bg-accent/10 text-text"
                    : "border-transparent text-muted hover:border-border hover:bg-surface hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{NAV_COPY[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border pt-4">
          <Button variant="secondary" size="md" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
