import type {Transition, Variants} from "framer-motion";

export const INTRO_ANIMATION = {
  blackScreenSeconds: 0.5,
  logoRevealSeconds: 0.7,
  imageRevealSeconds: 1.4,
  cinematicZoomSeconds: 10,
  contentRevealSeconds: 0.7,
  contentStaggerSeconds: 0.12,
  enterTransitionSeconds: 0.7,
} as const;

const STANDARD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function createImageRevealVariants(reduceMotion: boolean): Variants {
  const imageDelay = reduceMotion
    ? 0
    : INTRO_ANIMATION.blackScreenSeconds + INTRO_ANIMATION.logoRevealSeconds;

  return {
    hidden: {
      opacity: 0,
      filter: reduceMotion ? "blur(0px)" : "blur(20px)",
      scale: reduceMotion ? 1 : 1.03,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.imageRevealSeconds,
        delay: imageDelay,
        ease: STANDARD_EASE,
      },
    },
    exit: {
      opacity: 0,
      filter: reduceMotion ? "blur(0px)" : "blur(14px)",
      scale: 1.1,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.enterTransitionSeconds,
        ease: "easeInOut",
      },
    },
  };
}

export function createLogoVariants(reduceMotion: boolean): Variants {
  return {
    hidden: {opacity: 0, scale: reduceMotion ? 1 : 0.98},
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.logoRevealSeconds,
        delay: reduceMotion ? 0 : INTRO_ANIMATION.blackScreenSeconds,
        ease: STANDARD_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.enterTransitionSeconds * 0.5,
      },
    },
  };
}

export function createContentItemVariants(reduceMotion: boolean): Variants {
  return {
    hidden: {opacity: 0, y: reduceMotion ? 0 : 24},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.contentRevealSeconds,
        ease: STANDARD_EASE,
      },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -10,
      transition: {
        duration: reduceMotion ? 0 : INTRO_ANIMATION.enterTransitionSeconds * 0.5,
        ease: "easeInOut",
      },
    },
  };
}

export function createCinematicZoomTransition(reduceMotion: boolean): Transition {
  if (reduceMotion) {
    return {duration: 0};
  }

  return {
    duration: INTRO_ANIMATION.cinematicZoomSeconds,
    ease: "linear",
    repeat: Infinity,
    repeatType: "reverse",
  };
}

export const HOMEPAGE_ENTER_TRANSITION: Transition = {
  duration: INTRO_ANIMATION.enterTransitionSeconds,
  ease: "easeInOut",
};
