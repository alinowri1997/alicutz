"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { INSTAGRAM_LINK } from "@/constants/homepage";

const AUTOPLAY_MS = 4000;

const PORTFOLIO_IMAGES = [
  {
    src: "/gallery/portfolio-01.jpg",
    alt: "Men's skin fade haircut in Istanbul with clean taper and textured top",
  },
  {
    src: "/gallery/portfolio-02.jpg",
    alt: "Precision beard styling and line-up by a professional men's barber in Istanbul",
  },
  {
    src: "/gallery/portfolio-03.jpg",
    alt: "Modern men's haircut with natural volume and sharp side blend",
  },
  {
    src: "/gallery/portfolio-04.jpg",
    alt: "Low fade haircut with detailed contour work and clean neckline",
  },
  {
    src: "/gallery/portfolio-05.jpg",
    alt: "Contemporary men's haircut and beard shaping for a balanced profile",
  },
  {
    src: "/gallery/portfolio-06.jpg",
    alt: "Hair coloring result for men with natural tone correction and shine",
  },
  {
    src: "/gallery/portfolio-07.jpg",
    alt: "Classic short men's haircut with refined scissor finish",
  },
  {
    src: "/gallery/portfolio-08.jpg",
    alt: "High-contrast fade haircut with sharp temple and side detail",
  },
  {
    src: "/gallery/portfolio-09.jpg",
    alt: "Professional men's grooming result with clean cut and beard definition",
  },
] as const;

export function HeroPortfolioShowcase(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (isPaused || shouldReduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % PORTFOLIO_IMAGES.length);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, shouldReduceMotion]);

  const currentImage = PORTFOLIO_IMAGES[activeIndex];

  return (
    <article id="portfolio" className="card-base card-premium overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:gap-5">
        <Link
          href={INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Ali Cutz Instagram portfolio"
          className="group relative block overflow-hidden rounded-2xl border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-[4/5]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImage.src}
                initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              >
                <Image
                  src={currentImage.src}
                  alt={currentImage.alt}
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
            <p className="type-h6">View More on Instagram</p>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="type-small mt-1 text-muted">Explore more of our latest work on Instagram.</p>
        </div>
      </div>
    </article>
  );
}