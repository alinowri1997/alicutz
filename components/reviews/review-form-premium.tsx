"use client";

import * as React from "react";
import {createPortal} from "react-dom";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {Star} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import type {ReviewRating} from "@/lib/types/reviews";
import {cn} from "@/lib/utils";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

const RATING_LABELS: Record<ReviewRating, string> = {
  5: "Excellent",
  4: "Very Good",
  3: "Good",
  2: "Needs Improvement",
  1: "Poor",
};

const MIN_REVIEW_LENGTH = 20;
const MAX_REVIEW_LENGTH = 500;
const SHEET_BREAKPOINT = 768;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidget = {
  render: (container: Element, options: {sitekey: string; size?: string; callback: (token: string) => void; "error-callback"?: () => void; "expired-callback"?: () => void}) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

function useViewportIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(`(max-width: ${SHEET_BREAKPOINT - 1}px)`);
    const update = (): void => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function buildSyntheticEmail(customerName: string, review: string): string {
  const signature = `${customerName}:${review}`.trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < signature.length; index += 1) {
    hash = (hash * 31 + signature.charCodeAt(index)) >>> 0;
  }

  const safeName = customerName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  return `${safeName || "guest"}.${hash.toString(36)}@alicutz.review`;
}

function useTextareaAutoSize(value: string): React.RefObject<HTMLTextAreaElement | null> {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    node.style.height = "0px";
    node.style.height = `${Math.max(132, node.scrollHeight)}px`;
  }, [value]);

  return ref;
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined" || window.turnstile) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), {once: true});
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile.")), {once: true});
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  });
}

function RatingStars({value, onChange}: {value: ReviewRating; onChange: (value: ReviewRating) => void}): React.JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="How was your experience?">
      {[1, 2, 3, 4, 5].map((rating) => {
        const active = value >= rating;

        return (
          <motion.button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} stars, ${RATING_LABELS[rating as ReviewRating]}`}
            onClick={() => onChange(rating as ReviewRating)}
            className={cn(
              "group inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b36a]/70",
              active ? "border-[#d7b36a]/60 bg-[#d7b36a]/10 text-[#e8c97c]" : "border-border/70 bg-white/[0.02] text-white/30 hover:border-[#d7b36a]/35 hover:bg-white/[0.04]",
            )}
            whileHover={reducedMotion ? undefined : {scale: 1.04}}
            whileTap={reducedMotion ? undefined : {scale: 0.96}}
          >
            <Star className={cn("h-9 w-9 transition-colors", active ? "fill-current" : "")} aria-hidden="true" />
          </motion.button>
        );
      })}
      <div className="min-w-0 flex-1 pl-1">
        <p className="text-sm font-medium text-text">{RATING_LABELS[value]}</p>
        <p className="text-xs text-muted">Choose the rating that best matches your visit.</p>
      </div>
    </div>
  );
}

export function ReviewForm({open, onOpenChange, onSubmitted}: ReviewFormProps): React.ReactElement | null {
  const isMobile = useViewportIsMobile();
  const reducedMotion = useReducedMotion();
  const [name, setName] = React.useState("");
  const [review, setReview] = React.useState("");
  const [rating, setRating] = React.useState<ReviewRating>(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = React.useState(!TURNSTILE_SITE_KEY);
  const textareaRef = useTextareaAutoSize(review);
  const honeypotRef = React.useRef<HTMLInputElement | null>(null);
  const turnstileRef = React.useRef<HTMLDivElement | null>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const turnstileResolveRef = React.useRef<((token: string) => void) | null>(null);
  const turnstileTimeoutRef = React.useRef<number | null>(null);

  const closeForm = React.useCallback(() => {
    setTurnstileToken(null);
    onOpenChange(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeForm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeForm, open]);

  React.useEffect(() => {
    if (!open || !TURNSTILE_SITE_KEY || !turnstileRef.current || widgetIdRef.current) {
      return;
    }

    let cancelled = false;

    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: "invisible",
          callback: (token: string) => {
            setTurnstileToken(token);
            if (turnstileTimeoutRef.current) {
              window.clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
            turnstileResolveRef.current?.(token);
            turnstileResolveRef.current = null;
          },
          "error-callback": () => {
            setTurnstileReady(false);
            turnstileResolveRef.current = null;
            if (turnstileTimeoutRef.current) {
              window.clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
          },
          "expired-callback": () => {
            setTurnstileToken(null);
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current);
            }
            turnstileResolveRef.current = null;
            if (turnstileTimeoutRef.current) {
              window.clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
          },
        });

        setTurnstileReady(true);
      })
      .catch(() => {
        setTurnstileReady(false);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [open]);

  const reviewLength = review.trim().length;
  const nameLength = name.trim().length;
  const canSubmit = !isSubmitting && turnstileReady && nameLength >= 2 && reviewLength >= MIN_REVIEW_LENGTH && reviewLength <= MAX_REVIEW_LENGTH;

  async function getTurnstileToken(): Promise<string | null> {
    if (!TURNSTILE_SITE_KEY) {
      return null;
    }

    if (turnstileToken) {
      return turnstileToken;
    }

    if (!widgetIdRef.current || !window.turnstile) {
      return null;
    }

    return new Promise<string>((resolve) => {
      turnstileResolveRef.current = resolve;
      turnstileTimeoutRef.current = window.setTimeout(() => {
        turnstileResolveRef.current = null;
        resolve("");
        turnstileTimeoutRef.current = null;
      }, 6000);

      const widgetId = widgetIdRef.current;
      if (!window.turnstile || !widgetId) {
        resolve("");
        return;
      }

      window.turnstile.execute(widgetId);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedName = name.trim();
      const token = await getTurnstileToken();
      const honeypotValue = honeypotRef.current?.value?.trim() ?? "";

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          customerName: trimmedName,
          rating,
          review: review.trim(),
          honeypot: honeypotValue,
          turnstileToken: token ?? undefined,
          email: buildSyntheticEmail(trimmedName, review.trim()),
        }),
      });

      const payload = (await response.json()) as {success: boolean; message?: string};

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Failed to submit review.");
      }

      setName("");
      setReview("");
      setRating(5);
      onSubmitted();
      closeForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120]">
        <motion.button
          type="button"
          aria-label="Close review form"
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onClick={() => closeForm()}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-form-title"
          aria-describedby="review-form-description"
          className={cn(
            "relative mx-auto w-full overflow-hidden border border-border/70 bg-surface shadow-[0_32px_90px_rgba(0,0,0,0.6)]",
            isMobile
              ? "mt-auto max-h-[92vh] rounded-t-[30px] border-b-0"
              : "top-1/2 flex max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-[30px]",
          )}
          initial={reducedMotion ? {opacity: 1} : isMobile ? {y: "100%", opacity: 1} : {scale: 0.96, y: 16, opacity: 0}}
          animate={reducedMotion ? {opacity: 1} : isMobile ? {y: 0, opacity: 1} : {scale: 1, y: 0, opacity: 1}}
          exit={reducedMotion ? {opacity: 0} : isMobile ? {y: "100%", opacity: 1} : {scale: 0.98, y: 10, opacity: 0}}
          transition={{duration: 0.25, ease: [0.16, 1, 0.3, 1]}}
          style={isMobile ? {position: "absolute", left: 0, right: 0, bottom: 0} : {position: "absolute", left: "50%"}}
        >
          {!isMobile ? (
            <div className="hidden w-full max-w-[5px] rounded-l-[30px] bg-gradient-to-b from-[#d7b36a]/50 via-[#d7b36a]/20 to-transparent md:block" />
          ) : null}

          <div className="max-h-[92vh] w-full overflow-y-auto p-5 sm:p-6" style={isMobile ? {paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)"} : undefined}>
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/12" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Client Review</p>
              <h2 id="review-form-title" className="type-h3 text-text">
                Share your experience
              </h2>
              <p id="review-form-description" className="type-small max-w-[48ch] text-muted">
                A simple review takes less than a minute.
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
              <section className="space-y-3 rounded-[28px] border border-border/70 bg-white/[0.02] p-4 sm:p-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">How was your experience?</p>
                  <RatingStars value={rating} onChange={setRating} />
                </div>
              </section>

              <section className="space-y-4 rounded-[28px] border border-border/70 bg-white/[0.02] p-4 sm:p-5">
                <div className="space-y-1.5">
                  <label htmlFor="review-name" className="text-xs uppercase tracking-[0.16em] text-muted">
                    Your name
                  </label>
                  <Input
                    id="review-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    maxLength={80}
                    required
                    className="h-12 rounded-[24px] border-border/70 bg-background/70 px-4 text-sm transition focus:border-[#d7b36a]/60 focus:ring-[#d7b36a]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="review-text" className="text-xs uppercase tracking-[0.16em] text-muted">
                    Review
                  </label>
                  <Textarea
                    id="review-text"
                    ref={textareaRef}
                    value={review}
                    onChange={(event) => setReview(event.target.value.slice(0, MAX_REVIEW_LENGTH))}
                    placeholder="Tell us what you liked about your haircut..."
                    minLength={MIN_REVIEW_LENGTH}
                    maxLength={MAX_REVIEW_LENGTH}
                    required
                    className="min-h-[150px] resize-none rounded-[24px] border-border/70 bg-background/70 px-4 py-3 text-sm leading-6 transition focus:border-[#d7b36a]/60 focus:ring-[#d7b36a]/20"
                  />
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Minimum {MIN_REVIEW_LENGTH} characters</span>
                    <span>{reviewLength}/{MAX_REVIEW_LENGTH}</span>
                  </div>
                </div>
              </section>

              <div className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0" aria-hidden="true">
                <input ref={honeypotRef} type="text" name="company" tabIndex={-1} autoComplete="off" />
                <div ref={turnstileRef} />
              </div>

              <AnimatePresence>
                {error ? (
                  <motion.div
                    className="rounded-[22px] border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 8}}
                  >
                    {error}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="flex justify-center pt-1">
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!canSubmit}
                  className={cn(
                    "min-h-12 w-full max-w-[320px] rounded-full border transition-all duration-300",
                    canSubmit
                      ? "border-[#d7b36a]/60 bg-[#d7b36a] text-black shadow-[0_12px_30px_rgba(215,179,106,0.28)] hover:border-[#e6ca84] hover:bg-[#e6ca84]"
                      : "border-border/70 bg-transparent text-muted",
                  )}
                >
                  {isSubmitting ? "Submitting..." : "Submit review"}
                </Button>
              </div>

              <p className="text-center text-xs text-muted">
                Your review will appear after approval.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
