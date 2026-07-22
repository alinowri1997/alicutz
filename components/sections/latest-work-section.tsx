"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";

import {INSTAGRAM_LINK} from "@/constants/homepage";

const AUTOPLAY_MS = 5000;

const FEATURED_CUTS = [
  {
    src: "/gallery/mens-skin-fade-istanbul-premium-barber.jpg",
    alt: "Textured skin fade by Alicutz in Istanbul",
    postUrl: "https://www.instagram.com/p/DBvA1icutz1/",
  },
  {
    src: "/gallery/beard-styling-istanbul-barber-alicutz.jpg",
    alt: "Precision beard styling by Alicutz",
    postUrl: "https://www.instagram.com/p/DBvA1icutz2/",
  },
  {
    src: "/gallery/modern-haircut-istanbul-bomonti-barber.jpg",
    alt: "Modern layered haircut in Bomonti",
    postUrl: "https://www.instagram.com/p/DBvA1icutz3/",
  },
  {
    src: "/gallery/low-fade-haircut-sisli-istanbul.jpg",
    alt: "Low fade with clean temple transition",
    postUrl: "https://www.instagram.com/p/DBvA1icutz4/",
  },
  {
    src: "/gallery/mens-haircut-and-beard-shaping-istanbul.jpg",
    alt: "Haircut and beard shaping pairing",
    postUrl: "https://www.instagram.com/p/DBvA1icutz5/",
  },
  {
    src: "/gallery/mens-hair-coloring-istanbul-premium.jpg",
    alt: "Premium men hair coloring result",
    postUrl: "https://www.instagram.com/p/DBvA1icutz6/",
  },
] as const;

export function LatestWorkSection(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);

  const nextSlide = React.useCallback(() => {
    setActiveIndex((current) => (current + 1) % FEATURED_CUTS.length);
  }, []);

  const previousSlide = React.useCallback(() => {
    setActiveIndex((current) => (current - 1 + FEATURED_CUTS.length) % FEATURED_CUTS.length);
  }, []);

  React.useEffect(() => {
    if (isPaused) {
      return;
    }

    const intervalId = window.setInterval(nextSlide, AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPaused, nextSlide]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>): void => {
    if (touchStartX === null) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) >= 40) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    setTouchStartX(null);
  };

  const nextIndex = (activeIndex + 1) % FEATURED_CUTS.length;
  const activeCut = FEATURED_CUTS[activeIndex];
  const nextCut = FEATURED_CUTS[nextIndex];

  return (
    <section id="gallery" aria-labelledby="featured-cuts-heading" className="py-16 sm:py-20 md:py-24">
      <div className="container space-y-10">
        <div className="space-y-2">
          <h2 id="featured-cuts-heading" className="type-h2 text-text">
            Featured Cuts
          </h2>
        </div>

        <div
          className="hidden md:grid md:grid-cols-[minmax(0,1fr)_clamp(42px,7vw,72px)] md:items-stretch md:gap-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          aria-label="Featured cuts carousel"
        >
          <motion.div
            key={activeCut.src}
            initial={{opacity: 0.85, scale: 0.985}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
            className="relative"
          >
            <Link
              href={activeCut.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_45px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="View cut on Instagram"
            >
              <Image
                src={activeCut.src}
                alt={activeCut.alt}
                width={1920}
                height={2560}
                priority={activeIndex === 0}
                sizes="(min-width: 1024px) 78vw, 100vw"
                className="aspect-[3/4] h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-black/0 p-6 transition-colors duration-300 group-hover:bg-black/35">
                <span className="type-small text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {"View on Instagram ->"}
                </span>
              </div>
            </Link>
          </motion.div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60">
            <Link
              href={nextCut.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Preview next cut on Instagram"
            >
              <Image
                src={nextCut.src}
                alt={nextCut.alt}
                width={1920}
                height={2560}
                sizes="8vw"
                className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
            </Link>
          </div>
        </div>

        <div
          className="md:hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Featured cuts carousel"
        >
          <div className="overflow-hidden px-2">
            <motion.div
              className="flex"
              animate={{x: `-${activeIndex * 100}%`}}
              transition={{duration: 0.48, ease: [0.22, 1, 0.36, 1]}}
            >
              {FEATURED_CUTS.map((item, index) => (
                <div key={item.src} className="w-full shrink-0 px-1">
                  <Link
                    href={item.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_14px_32px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="View cut on Instagram"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={1920}
                      height={2560}
                      priority={index === 0}
                      sizes="92vw"
                      className="aspect-[3/4] h-full w-full object-cover"
                    />
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="type-small inline-flex items-center text-text transition-colors duration-[var(--duration-fast)] hover:text-accent focus-visible:outline-none focus-visible:text-accent"
          >
            {"Explore More ->"}
          </Link>
          <p className="type-caption text-muted">@ALICUTZZZZ</p>
        </div>
      </div>
    </section>
  );
}
