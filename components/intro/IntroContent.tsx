"use client";

import * as React from "react";
import {motion, type Variants} from "framer-motion";

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
          transition={{delay: isExiting ? 0 : 0.95}}
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
          transition={{delay: isExiting ? 0 : 1.06}}
          className={introStyles.description}
        >
          Premium barber experience crafted for gentlemen who value precision, style and confidence.
        </motion.p>

        <motion.div
          initial="hidden"
          animate={animateState}
          variants={itemVariants}
          transition={{delay: isExiting ? 0 : 1.17}}
        >
          <IntroButton onClick={onEnter} />
        </motion.div>

        <motion.p
          initial={{opacity: 0}}
          animate={isExiting ? {opacity: 0} : {opacity: 0.4}}
          transition={{delay: isExiting ? 0 : 1.26, duration: isExiting ? 0.2 : 0.5}}
          className={introStyles.hint}
          aria-hidden="true"
        >
          Tap anywhere to enter
        </motion.p>
      </div>
    </div>
  );
}
