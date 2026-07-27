"use client";

import * as React from "react";

import {Button} from "@/components/ui/button";
import {Dialog} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import type {ReviewRating} from "@/lib/types/reviews";
import {cn} from "@/lib/utils";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSubmitted: () => void;
}

interface CountryOption {
  code: string;
  label: string;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  {code: "TR", label: "Turkey"},
  {code: "GB", label: "United Kingdom"},
  {code: "DE", label: "Germany"},
  {code: "AE", label: "United Arab Emirates"},
  {code: "SA", label: "Saudi Arabia"},
  {code: "IR", label: "Iran"},
  {code: "RU", label: "Russia"},
  {code: "US", label: "United States"},
];

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  ar: "Arabic",
  fa: "Persian",
  ru: "Russian",
};

const MIN_REVIEW_LENGTH = 20;
const MAX_REVIEW_LENGTH = 500;

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialsToEmailSeed(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "guest";
}

function countryToFlag(countryCode: string): string {
  const normalized = countryCode.toUpperCase();
  const first = normalized.codePointAt(0);
  const second = normalized.codePointAt(1);

  if (!first || !second) {
    return "🌍";
  }

  const regionalIndicatorA = 0x1f1e6;
  const asciiA = 65;

  return String.fromCodePoint(
    regionalIndicatorA + (first - asciiA),
    regionalIndicatorA + (second - asciiA),
  );
}

function detectCountryCode(): string {
  const locale = typeof navigator !== "undefined" ? navigator.language : "tr-TR";
  const localeRegion = locale.split("-")[1]?.toUpperCase();

  if (localeRegion && /^[A-Z]{2}$/.test(localeRegion)) {
    return localeRegion;
  }

  const resolvedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  const resolvedRegion = resolvedLocale.split("-")[1]?.toUpperCase();

  if (resolvedRegion && /^[A-Z]{2}$/.test(resolvedRegion)) {
    return resolvedRegion;
  }

  return "TR";
}

function detectLanguage(): {code: string; label: string} {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  const code = locale.split("-")[0]?.toLowerCase() ?? "en";

  if (code in LANGUAGE_NAMES) {
    return {code, label: LANGUAGE_NAMES[code]};
  }

  return {code: "en", label: LANGUAGE_NAMES.en};
}

function StarRating({
  value,
  onChange,
}: {
  value: ReviewRating;
  onChange: (value: ReviewRating) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = value >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} stars`}
            className="rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => onChange(star as ReviewRating)}
          >
            <span className={cn("text-xl", isActive ? "text-[#d7b36a]" : "text-white/25")}>★</span>
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({open, onOpenChange, onReviewSubmitted}: ReviewFormProps): React.JSX.Element {
  const [name, setName] = React.useState("");
  const [review, setReview] = React.useState("");
  const [rating, setRating] = React.useState<ReviewRating>(5);
  const [countryCode, setCountryCode] = React.useState(() => detectCountryCode());
  const [language] = React.useState<{code: string; label: string}>(() => detectLanguage());
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [countryOpen, setCountryOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const node = textareaRef.current;

    if (!node) {
      return;
    }

    node.style.height = "0px";
    node.style.height = `${Math.max(110, node.scrollHeight)}px`;
  }, [review]);

  const reviewLength = review.trim().length;
  const nameLength = name.trim().length;

  const canSubmit =
    !isSubmitting &&
    nameLength >= 2 &&
    reviewLength >= MIN_REVIEW_LENGTH &&
    reviewLength <= MAX_REVIEW_LENGTH;

  async function uploadOptionalImage(reviewId: string): Promise<void> {
    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    await fetch(`/api/reviews/${reviewId}/media`, {
      method: "POST",
      body: formData,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedName = name.trim();
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: trimmedName,
          review: review.trim(),
          rating,
          email: `${initialsToEmailSeed(trimmedName)}.${Date.now()}@alicutz.review`,
          languageCode: language.code,
          language: language.label,
          countryCode,
          service: "Home Service",
          visitDate: toIsoDate(new Date()),
          tags: [],
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: {id: string};
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Failed to submit review.");
      }

      await uploadOptionalImage(payload.data.id);

      setName("");
      setReview("");
      setRating(5);
      setImageFile(null);
      onReviewSubmitted();
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share your review"
      description="Only your name, rating, and review are required."
    >
      <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-1.5">
          <label htmlFor="review-rating" className="text-xs uppercase tracking-[0.14em] text-muted">
            Rating
          </label>
          <div id="review-rating">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="review-name" className="text-xs uppercase tracking-[0.14em] text-muted">
            Name
          </label>
          <Input
            id="review-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="review-text" className="text-xs uppercase tracking-[0.14em] text-muted">
            Review
          </label>
          <Textarea
            id="review-text"
            ref={textareaRef}
            value={review}
            onChange={(event) => setReview(event.target.value.slice(0, MAX_REVIEW_LENGTH))}
            placeholder="Tell us about your experience"
            minLength={MIN_REVIEW_LENGTH}
            maxLength={MAX_REVIEW_LENGTH}
            required
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Min {MIN_REVIEW_LENGTH} characters</span>
            <span>{reviewLength}/{MAX_REVIEW_LENGTH}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white/[0.02] px-3 py-2">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Country</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen((value) => !value)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background text-base"
              aria-label="Select country"
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
            >
              {countryToFlag(countryCode)}
            </button>

            {countryOpen ? (
              <div className="absolute right-0 top-10 z-20 grid grid-cols-4 gap-1 rounded-lg border border-border/70 bg-surface p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]" role="listbox" aria-label="Country list">
                {COUNTRY_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    title={option.label}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border text-base transition",
                      option.code === countryCode
                        ? "border-[#d7b36a]/60 bg-[#d7b36a]/10"
                        : "border-border/70 bg-background hover:border-border",
                    )}
                    onClick={() => {
                      setCountryCode(option.code);
                      setCountryOpen(false);
                    }}
                  >
                    {countryToFlag(option.code)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="review-image" className="text-xs uppercase tracking-[0.14em] text-muted">
            Photo (optional)
          </label>
          <Input
            id="review-image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          />
        </div>

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Language: {language.code.toUpperCase()}</p>
          <Button type="submit" variant="accent" size="md" isLoading={isSubmitting} disabled={!canSubmit}>
            {isSubmitting ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
