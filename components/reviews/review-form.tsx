"use client";

import * as React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import {CalendarDays, CheckCircle2, Loader2, Star, UploadCloud, X} from "lucide-react";

import type {ReviewRating, ReviewService} from "@/lib/types/reviews";

interface ReviewFormProps {
  onReviewSubmitted: () => void;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

function getInitialLocaleData(): {country: string; language: string} {
  if (typeof navigator === "undefined") {
    return {country: "TR", language: "English"};
  }

  const locale = navigator.language?.split("-")[0] ?? "en";
  const region = navigator.language?.split("-")[1] ?? "TR";
  const language = new Intl.DisplayNames(["en"], {type: "language"}).of(locale) ?? "English";
  return {country: region.toUpperCase(), language};
}

const SERVICE_OPTIONS: ReviewService[] = ["Haircut", "Fade", "Color", "Beard", "Home Service", "Other"];

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });

  if (!blob) {
    return file;
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function clampRating(value: number): ReviewRating {
  if (value <= 1) {
    return 1;
  }
  if (value >= 5) {
    return 5;
  }

  return value as ReviewRating;
}

export function ReviewForm({onReviewSubmitted}: ReviewFormProps): React.JSX.Element {
  const localeData = React.useMemo(() => getInitialLocaleData(), []);
  const [customerName, setCustomerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [country, setCountry] = React.useState(localeData.country);
  const [language, setLanguage] = React.useState(localeData.language);
  const [service, setService] = React.useState<ReviewService>("Haircut");
  const [rating, setRating] = React.useState<ReviewRating>(5);
  const [review, setReview] = React.useState("");
  const [visitDate, setVisitDate] = React.useState("");
  const [images, setImages] = React.useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
  }, [images]);

  const onImageSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setErrorMessage("");

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      setErrorMessage("Only image uploads are supported for reviews.");
      return;
    }

    const allowedCount = Math.max(0, 3 - images.length);
    const accepted = imageFiles.slice(0, allowedCount);

    if (accepted.length < imageFiles.length) {
      setErrorMessage("You can upload up to 3 photos.");
    }

    const compressedFiles = await Promise.all(accepted.map((file) => compressImage(file)));
    const selected = compressedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...selected]);
  };

  const removeImage = (index: number): void => {
    setImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((_, idx) => idx !== index);
    });
  };

  const resetForm = (): void => {
    setCustomerName("");
    setEmail("");
    setService("Haircut");
    setRating(5);
    setReview("");
    setVisitDate("");
    setImages((current) => {
      current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          email,
          country,
          language,
          service,
          rating,
          review,
          visitDate: visitDate || undefined,
        }),
      });

      const result = (await response.json()) as {success: boolean; data?: {id: string}; message?: string};

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "Failed to submit review.");
      }

      await Promise.all(
        images.map(async (image) => {
          const formData = new FormData();
          formData.append("file", image.file);

          const uploadResponse = await fetch(`/api/reviews/${result.data?.id}/media`, {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadResult = (await uploadResponse.json()) as {message?: string};
            throw new Error(uploadResult.message ?? "Failed to upload review image.");
          }
        }),
      );

      setSuccessMessage("Thank you. Your review was submitted for approval.");
      resetForm();
      onReviewSubmitted();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-border/70 bg-white/[0.04] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-md md:p-7"
      initial={{opacity: 0, y: 24}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.15}}
      transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
      aria-label="Submit customer review"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text">Share your experience</h3>
          <p className="mt-1 text-sm text-muted">Verified premium feedback helps future clients decide with confidence.</p>
        </div>
      </div>

      {successMessage ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Name</span>
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="h-11 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            placeholder="Your full name"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            placeholder="name@email.com"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Country</span>
          <input
            required
            value={country}
            onChange={(event) => setCountry(event.target.value.toUpperCase())}
            maxLength={8}
            className="h-11 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            placeholder="TR"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Language</span>
          <input
            required
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="h-11 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            placeholder="English"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Service</span>
          <select
            value={service}
            onChange={(event) => setService(event.target.value as ReviewService)}
            className="h-11 rounded-xl border border-border/70 bg-black/20 px-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs uppercase tracking-[0.14em] text-muted">Visit date (optional)</span>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="date"
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-border/70 bg-black/20 pl-10 pr-3 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            />
          </div>
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Rating</p>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Review rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              onClick={() => setRating(clampRating(value))}
              className="rounded-lg p-1.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label={`Set ${value} star rating`}
            >
              <Star className={`h-5 w-5 ${rating >= value ? "fill-amber-400 text-amber-400" : "text-white/25"}`} />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted">{rating}.0</span>
        </div>
      </div>

      <label className="mt-5 grid gap-1.5">
        <span className="text-xs uppercase tracking-[0.14em] text-muted">Review</span>
        <textarea
          required
          minLength={20}
          maxLength={2000}
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows={5}
          className="rounded-xl border border-border/70 bg-black/20 px-3 py-2.5 text-sm text-text outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
          placeholder="Tell other clients about your cut quality, professionalism, and overall experience."
        />
        <span className="text-xs text-muted">{review.length}/2000</span>
      </label>

      <div className="mt-5">
        <label className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-black/15 px-4 py-3 text-sm text-muted transition hover:border-white/35 hover:text-white">
          <UploadCloud className="h-4 w-4" aria-hidden="true" />
          <span>Upload up to 3 customer photos</span>
          <input type="file" accept="image/*" multiple onChange={(event) => void onImageSelect(event)} className="hidden" />
        </label>

        {images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <motion.div
                key={image.previewUrl}
                className="group relative overflow-hidden rounded-xl border border-border/80"
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
              >
                <Image
                  src={image.previewUrl}
                  alt={`Selected review image ${index + 1}`}
                  width={160}
                  height={80}
                  unoptimized
                  className="h-20 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Remove selected image ${index + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#d4af37] px-4 text-sm font-semibold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Submitting...
          </>
        ) : (
          "Submit review"
        )}
      </button>
    </motion.form>
  );
}
