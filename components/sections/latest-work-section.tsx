"use client";

import Image from "next/image";
import Link from "next/link";
import {motion} from "framer-motion";

import {INSTAGRAM_LINK} from "@/constants/homepage";

const LATEST_WORK_IMAGES = [
  "/gallery/mens-skin-fade-istanbul-premium-barber.jpg",
  "/gallery/beard-styling-istanbul-barber-alicutz.jpg",
  "/gallery/modern-haircut-istanbul-bomonti-barber.jpg",
  "/gallery/low-fade-haircut-sisli-istanbul.jpg",
  "/gallery/mens-haircut-and-beard-shaping-istanbul.jpg",
  "/gallery/mens-hair-coloring-istanbul-premium.jpg",
] as const;

export function LatestWorkSection(): React.JSX.Element {
  return (
    <section id="gallery" aria-labelledby="latest-work-heading" className="py-16 sm:py-20 md:py-24">
      <div className="container space-y-10">
        <div className="space-y-3">
          <p className="type-caption text-muted">Instagram</p>
          <h2 id="latest-work-heading" className="type-h2 text-text">
            Latest Work
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LATEST_WORK_IMAGES.map((src, index) => (
            <motion.div
              key={src}
              initial={{opacity: 0, y: 12}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.2}}
              transition={{duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1]}}
            >
              <Link
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Open Instagram gallery"
              >
                <Image
                  src={src}
                  alt="Alicutz latest barber work"
                  width={1920}
                  height={2560}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                  className="aspect-[4/5] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          href={INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="type-small inline-flex min-h-11 items-center rounded-full border border-border px-7 py-3 text-text transition-colors duration-[var(--duration-fast)] hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          View Instagram
        </Link>
      </div>
    </section>
  );
}
