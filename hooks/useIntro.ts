"use client";

import * as React from "react";

const INTRO_STORAGE_KEY = "alicutz.intro.lastSeenAt";
const REAPPEAR_DAYS = 30;
const ENTER_TRANSITION_MS = 700;

type IntroPhase = "checking" | "visible" | "exiting" | "hidden";

function shouldShowIntroNow(): boolean {
  try {
    const stored = window.localStorage.getItem(INTRO_STORAGE_KEY);
    if (!stored) {
      return true;
    }

    const lastSeen = Number(stored);
    if (!Number.isFinite(lastSeen) || lastSeen <= 0) {
      return true;
    }

    const elapsedMs = Date.now() - lastSeen;
    const maxAgeMs = REAPPEAR_DAYS * 24 * 60 * 60 * 1000;

    return elapsedMs >= maxAgeMs;
  } catch {
    return true;
  }
}

function persistSeenNow(): void {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

export interface UseIntroResult {
  phase: IntroPhase;
  showIntro: boolean;
  enter: () => void;
  skip: () => void;
}

export function useIntro(): UseIntroResult {
  const [phase, setPhase] = React.useState<IntroPhase>("checking");
  const hasTransitionStartedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = shouldShowIntroNow() ? "visible" : "hidden";
      setPhase(next);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    if (phase !== "visible" && phase !== "exiting" && phase !== "checking") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const enter = React.useCallback(() => {
    if (hasTransitionStartedRef.current || phase !== "visible") {
      return;
    }

    hasTransitionStartedRef.current = true;
    setPhase("exiting");

    window.setTimeout(() => {
      persistSeenNow();
      setPhase("hidden");
      hasTransitionStartedRef.current = false;
    }, ENTER_TRANSITION_MS);
  }, [phase]);

  const skip = React.useCallback(() => {
    if (phase === "hidden") {
      return;
    }

    persistSeenNow();
    hasTransitionStartedRef.current = false;
    setPhase("hidden");
  }, [phase]);

  return {
    phase,
    showIntro: phase !== "hidden",
    enter,
    skip,
  };
}
