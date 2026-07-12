"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FaInstagram } from "react-icons/fa";

import { INSTAGRAM_LINK } from "@/constants/homepage";

const AUTOPLAY_MS = 4000;

const PORTFOLIO_IMAGE_PATHS = [
  "/gallery/portfolio-01.jpg",
  "/gallery/portfolio-02.jpg",
  "/gallery/portfolio-03.jpg",
  "/gallery/portfolio-04.jpg",
  "/gallery/portfolio-05.jpg",
  "/gallery/portfolio-06.jpg",
  "/gallery/portfolio-07.jpg",
  "/gallery/portfolio-08.jpg",
  "/gallery/portfolio-09.jpg",
] as const;

export function HeroPortfolioShowcase(): React.JSX.Element {
  const tGallery = useTranslations("Gallery");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (isPaused || shouldReduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % PORTFOLIO_IMAGE_PATHS.length);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, shouldReduceMotion]);

  const currentImagePath = PORTFOLIO_IMAGE_PATHS[activeIndex];
  const currentImageAlt = tGallery(`featuredAlt.${activeIndex + 1}`);

  return (
    <article className="card-base card-premium overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:gap-5">
        <Link
          href={INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tGallery("portfolioAriaLabel")}
          className="group relative block overflow-hidden rounded-2xl border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-[6/5] sm:aspect-[4/5]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImagePath}
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              >
                <Image
                  src={currentImagePath}
                  alt={currentImageAlt}
                  fill
                  sizes="(min-width: 1024px) 38vw, (min-width: 768px) 44vw, 92vw"
                  quality={90}
                  priority={activeIndex === 0}
                  className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>

        <div className="px-1">
          <Link
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
          >
            <FaInstagram className="h-5 w-5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" aria-hidden="true" />
            <p className="type-h6">{tGallery("viewMore")}</p>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="type-small mt-1 text-muted">{tGallery("portfolioDescription")}</p>
        </div>
      </div>
    </article>
  );
}