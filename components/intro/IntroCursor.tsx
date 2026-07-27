"use client";

import * as React from "react";
import {motion} from "framer-motion";

interface IntroCursorProps {
  active: boolean;
}

interface CursorPoint {
  x: number;
  y: number;
}

export function IntroCursor({active}: IntroCursorProps): React.JSX.Element | null {
  const [point, setPoint] = React.useState<CursorPoint>({x: -100, y: -100});
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!active) {
      return;
    }

    const handleMove = (event: MouseEvent): void => {
      setPoint({x: event.clientX, y: event.clientY});

      const target = event.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('[data-intro-interactive="true"], a, button'),
      );
      setIsExpanded(isInteractive);
    };

    window.addEventListener("mousemove", handleMove, {passive: true});

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[130] h-8 w-8 rounded-full border border-white/85"
      animate={{
        x: point.x - 16,
        y: point.y - 16,
        scale: isExpanded ? 1.28 : 1,
      }}
      transition={{
        x: {type: "spring", stiffness: 380, damping: 36, mass: 0.55},
        y: {type: "spring", stiffness: 380, damping: 36, mass: 0.55},
        scale: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
      }}
    />
  );
}
