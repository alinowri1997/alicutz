"use client";

import {Menu, ExternalLink} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuOpen: () => void;
  className?: string;
}

export function AdminHeader({title, subtitle, onMenuOpen, className}: AdminHeaderProps): React.JSX.Element {
  return (
    <header className={cn("sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur", className)}>
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text md:hidden"
            aria-label="Open admin navigation"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="type-caption text-muted">Admin</p>
            <h1 className="type-h6 truncate text-text">{title}</h1>
            {subtitle ? <p className="type-small truncate text-muted">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="hidden gap-2 sm:inline-flex">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open site
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
