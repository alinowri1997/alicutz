"use client";

import * as React from "react";
import Image from "next/image";
import {motion, type Transition, type Variants} from "framer-motion";

import {introStyles} from "@/components/intro/styles";

interface IntroImageProps {
  variants: Variants;
  isExiting: boolean;
  zoomTransition: Transition;
  reduceMotion: boolean;
}

export function IntroImage({variants, isExiting, zoomTransition, reduceMotion}: IntroImageProps): React.JSX.Element {
  const animateState = isExiting ? "exit" : "visible";

  return (
    <div className={introStyles.imagePane}>
      <motion.div
        className={introStyles.imageSurface}
        initial="hidden"
        animate={animateState}
        variants={variants}
      >
        <motion.div
          className={introStyles.imageFrame}
          animate={isExiting || reduceMotion ? {scale: 1} : {scale: [1, 1.03]}}
          transition={zoomTransition}
        >
          <Image
            src="/images/brand/ali-intro.webp"
            alt="Ali Cutz premium grooming portrait"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 58vw"
            className={introStyles.image}
          />
          <div className={introStyles.cinematicShade} />
          <div className={introStyles.leftGradient} />
          <div className={introStyles.vignette} />
          {reduceMotion ? null : (
            <motion.div
              className={introStyles.lightSweep}
              animate={{x: ["-18%", "132%"]}}
              transition={{duration: 12, repeat: Infinity, repeatDelay: 2, ease: "linear"}}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
