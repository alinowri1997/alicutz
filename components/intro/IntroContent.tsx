"use client";

import * as React from "react";
import {motion, type Variants} from "framer-motion";

import {INTRO_ANIMATION} from "@/components/intro/animations";
import {IntroButton} from "@/components/intro/IntroButton";
import {introStyles} from "@/components/intro/styles";

interface IntroContentProps {
  logoClassName: string;
  headlineClassName: string;
  itemVariants: Variants;
  logoVariants: Variants;
  isExiting: boolean;
  onEnter: () => void;
}

export function IntroContent({
  logoClassName,
  headlineClassName,
  itemVariants,
  logoVariants,
  isExiting,
  onEnter,
}: IntroContentProps): React.JSX.Element {
  const animateState = isExiting ? "exit" : "visible";
  const contentDelay = INTRO_ANIMATION.blackScreenSeconds + INTRO_ANIMATION.logoRevealSeconds + INTRO_ANIMATION.imageRevealSeconds;

  return (
    <div className={introStyles.contentWrap}>
      <div className={introStyles.contentInner}>
        <motion.p
          initial="hidden"
          animate={animateState}
          variants={logoVariants}
          className={logoClassName}
        >
          ALICUTZ
        </motion.p>

        <motion.h1
          initial="hidden"
          animate={animateState}
          variants={itemVariants}
          transition={{delay: isExiting ? 0 : contentDelay}}
          className={headlineClassName}
        >
          More Than a Haircut.
          <br />
          A Signature Experience.
        </motion.h1>

        <motion.p
          initial="hidden"
          animate={animateState}
          variants={itemVariants}
          transition={{delay: isExiting ? 0 : contentDelay + 0.12}}
          className={introStyles.description}
        >
          Premium barber experience crafted for gentlemen who value precision, style and confidence.
        </motion.p>

        <motion.div
          initial="hidden"
          animate={animateState}
          variants={itemVariants}
          transition={{delay: isExiting ? 0 : contentDelay + 0.24}}
        >
          <IntroButton onClick={onEnter} />
        </motion.div>
      </div>

      <motion.div
        initial={{opacity: 0, y: isExiting ? 0 : 12}}
        animate={isExiting ? {opacity: 0, y: 0} : {opacity: 0.4, y: 0}}
        transition={{delay: isExiting ? 0 : contentDelay + 0.34, duration: isExiting ? 0.2 : 0.7}}
        className={introStyles.bottomIndicator}
        aria-hidden="true"
        data-intro-interactive="true"
      >
        <p className="text-[11px] uppercase tracking-[0.24em]">Explore Alicutz</p>
        <p className="text-base leading-none">↓</p>
        <p className="text-[11px] uppercase tracking-[0.2em]">Tap Anywhere To Enter</p>
      </motion.div>
    </div>
  );
}
