"use client";

import * as React from "react";
import {Cormorant_Garamond, Inter} from "next/font/google";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";

import {
  createCinematicZoomTransition,
  createContentItemVariants,
  createImageRevealVariants,
  createLogoVariants,
  HOMEPAGE_ENTER_TRANSITION,
} from "@/components/intro/animations";
import {IntroContent} from "@/components/intro/IntroContent";
import {IntroCursor} from "@/components/intro/IntroCursor";
import {IntroImage} from "@/components/intro/IntroImage";
import {introStyles} from "@/components/intro/styles";
import {useIntro} from "@/hooks/useIntro";
import {cn} from "@/lib/utils";

const logoFont = Inter({subsets: ["latin"], weight: ["700"], display: "swap"});
const headlineFont = Cormorant_Garamond({subsets: ["latin"], weight: ["500"], display: "swap"});

interface IntroProps {
  children: React.ReactNode;
}

export function Intro({children}: IntroProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const {phase, showIntro, enter, skip} = useIntro();
  const [cursorEnabled, setCursorEnabled] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = (): void => {
      setCursorEnabled(media.matches);
    };

    apply();
    media.addEventListener("change", apply);

    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  const isExiting = phase === "exiting";
  const imageVariants = React.useMemo(() => createImageRevealVariants(Boolean(reduceMotion)), [reduceMotion]);
  const logoVariants = React.useMemo(() => createLogoVariants(Boolean(reduceMotion)), [reduceMotion]);
  const itemVariants = React.useMemo(() => createContentItemVariants(Boolean(reduceMotion)), [reduceMotion]);
  const zoomTransition = React.useMemo(() => createCinematicZoomTransition(Boolean(reduceMotion)), [reduceMotion]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      skip();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      enter();
    }
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={
          phase === "visible"
            ? {y: "100vh"}
            : {y: 0}
        }
        transition={HOMEPAGE_ENTER_TRANSITION}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {showIntro ? (
          <motion.section
            key="intro-overlay"
            className={cn(introStyles.overlay, cursorEnabled ? "cursor-none" : undefined)}
            initial={{opacity: 1}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: reduceMotion ? 0 : 0.35}}
            role="button"
            aria-label="Intro entrance. Click, press Enter or Space to enter website."
            tabIndex={0}
            onClick={enter}
            onTouchStart={enter}
            onKeyDown={handleKeyDown}
          >
            <div className={introStyles.frame}>
              <IntroContent
                logoClassName={`${logoFont.className} ${introStyles.logo}`}
                headlineClassName={`${headlineFont.className} ${introStyles.headline}`}
                itemVariants={itemVariants}
                logoVariants={logoVariants}
                isExiting={isExiting}
                onEnter={enter}
              />

              <IntroImage
                variants={imageVariants}
                isExiting={isExiting}
                zoomTransition={zoomTransition}
                reduceMotion={Boolean(reduceMotion)}
              />
            </div>

            <IntroCursor active={cursorEnabled} />
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}
