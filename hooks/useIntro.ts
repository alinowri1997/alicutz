"use client";

import * as React from "react";

const ENTER_TRANSITION_MS = 700;

type IntroPhase = "visible" | "exiting" | "hidden";

export interface UseIntroResult {
  phase: IntroPhase;
  showIntro: boolean;
  enter: () => void;
  skip: () => void;
}

export function useIntro(): UseIntroResult {
  const [phase, setPhase] = React.useState<IntroPhase>("visible");
  const hasTransitionStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (phase !== "visible" && phase !== "exiting") {
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
      setPhase("hidden");
      hasTransitionStartedRef.current = false;
    }, ENTER_TRANSITION_MS);
  }, [phase]);

  const skip = React.useCallback(() => {
    if (phase === "hidden") {
      return;
    }

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
