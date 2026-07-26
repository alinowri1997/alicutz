"use client";

import * as React from "react";

interface ReadingProgressBarProps {
  targetId: string;
}

export function ReadingProgressBar({targetId}: ReadingProgressBarProps): React.JSX.Element | null {
  const [progress, setProgress] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const updateProgress = (): void => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = target.scrollHeight;

      if (total <= 0) {
        setProgress(0);
        setIsVisible(false);
        return;
      }

      const started = rect.top <= viewportHeight * 0.25;
      const ended = rect.bottom <= viewportHeight * 0.2;
      const shouldShow = started && !ended;

      if (!shouldShow) {
        setProgress((value) => (value === 0 ? value : 0));
        setIsVisible(false);
        return;
      }

      const pixelsRead = Math.min(total, Math.max(0, viewportHeight * 0.3 - rect.top));
      const nextProgress = Math.min(100, Math.max(0, (pixelsRead / total) * 100));

      setProgress(nextProgress);
      setIsVisible(true);
    };

    let ticking = false;

    const onScrollOrResize = (): void => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
    };

    updateProgress();
    window.addEventListener("scroll", onScrollOrResize, {passive: true});
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent"
      style={{opacity: isVisible ? 1 : 0, transition: "opacity 180ms var(--easing-standard)"}}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${progress}%`,
          transition: "width 120ms linear",
        }}
      />
    </div>
  );
}
