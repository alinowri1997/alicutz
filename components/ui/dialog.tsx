"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import {cn} from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({open, onOpenChange, title, description, children}: DialogProps): React.JSX.Element | null {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        className={cn(
          "relative z-[81] w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-[0_28px_70px_rgba(0,0,0,0.55)]",
        )}
      >
        <div className="space-y-2">
          <h2 id="dialog-title" className="type-h4 text-text">
            {title}
          </h2>
          {description ? (
            <p id="dialog-description" className="type-small text-muted">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
