"use client";

import {Menu} from "lucide-react";

export interface TopbarProps {
  currentPage: string;
  onMenuOpen: () => void;
}

export function Topbar({currentPage, onMenuOpen}: TopbarProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#141414] text-[#f1f1f1] md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#8a8a8a]">Admin</p>
            <p className="text-sm font-medium text-[#f2f2f2]">{currentPage}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-[#8a8a8a]">Signed in as</p>
            <p className="text-sm text-[#ececec]">Admin</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#151515] text-xs font-semibold text-[#f2f2f2]">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
