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
          className="relative h-full w-full"
          animate={isExiting || reduceMotion ? {scale: 1} : {scale: [1, 1.05]}}
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
        </motion.div>
      </motion.div>
    </div>
  );
}
