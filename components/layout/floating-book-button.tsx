"use client";

import * as React from "react";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";

import {WHATSAPP_LINK} from "@/constants/homepage";

export function FloatingBookButton(): React.JSX.Element {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = (): void => {
      setIsVisible(window.scrollY > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: 12}}
          transition={{duration: 0.24, ease: [0.22, 1, 0.36, 1]}}
          className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 md:hidden"
        >
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="type-caption inline-flex min-h-10 items-center rounded-full border border-white/18 bg-black/88 px-5 py-2.5 text-white backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:border-white/35"
          >
            Book Appointment
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
