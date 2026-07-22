"use client";

import type {LucideIcon} from "lucide-react";
import {LayoutDashboard, LogOut, X} from "lucide-react";

import {cn} from "@/lib/utils";

export interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  items,
  activeKey,
  isOpen,
  onClose,
  onSelect,
  onLogout,
}: SidebarProps): React.JSX.Element {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/65 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0d0d0d] p-4 shadow-[0_18px_32px_rgba(0,0,0,0.4)] transition-transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-[#151515]">
              <LayoutDashboard className="h-4 w-4 text-[#f4f4f4]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#848484]">Alicutz</p>
              <p className="text-sm font-medium text-[#f1f1f1]">Admin Panel</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#151515] text-[#f1f1f1] md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1" aria-label="Admin navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  onClose();
                }}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors",
                  isActive
                    ? "border border-white/20 bg-[#191919] text-[#f5f5f5]"
                    : "border border-transparent text-[#ababab] hover:border-white/10 hover:bg-[#151515] hover:text-[#efefef]",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#161616] text-sm text-[#ececec] transition-colors hover:bg-[#1b1b1b]"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </aside>
    </>
  );
}
