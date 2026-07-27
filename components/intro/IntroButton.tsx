"use client";

import * as React from "react";

import {cn} from "@/lib/utils";

interface IntroButtonProps {
  onClick: () => void;
  className?: string;
}

export function IntroButton({onClick, className}: IntroButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border border-white/80 px-6 py-3 text-sm font-medium text-white",
        "transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] hover:bg-white hover:text-black",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        className,
      )}
      aria-label="Enter Alicutz website"
    >
      Book Appointment
    </button>
  );
}
