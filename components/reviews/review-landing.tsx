"use client";

import * as React from "react";
import {useRouter} from "next/navigation";

import {ReviewsSection} from "@/components/sections/reviews-section-premium";
import {defaultLocale} from "@/i18n/routing";

export function ReviewLanding(): React.JSX.Element {
  const router = useRouter();
  const redirectTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  return (
    <ReviewsSection
      initialFormOpen
      onReviewSubmitted={() => {
        if (redirectTimerRef.current) {
          window.clearTimeout(redirectTimerRef.current);
        }

        redirectTimerRef.current = window.setTimeout(() => {
          router.replace(`/${defaultLocale}`);
        }, 3000);
      }}
    />
  );
}