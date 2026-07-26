"use client";

import * as React from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {format, isValid, parseISO} from "date-fns";
import {CalendarDays, CheckCircle2, ChevronDown, Loader2, Sparkles, Star, Wand2} from "lucide-react";
import {useForm, Controller, useWatch} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import {z} from "zod";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {createReviewSchema} from "@/lib/schemas/reviews";
import type {ReviewService, ReviewTag} from "@/lib/types/reviews";
import {
  buildLanguageOptions,
  getBrowserLanguageSeed,
  REVIEW_TAG_OPTIONS,
  type LanguageOption,
  type ServiceOption,
} from "@/components/reviews/review-data";

const NAME_STORAGE_KEY = "alicutz.review.name";
const DEFAULT_VISIT_DATE = format(new Date(), "yyyy-MM-dd");
const AUTO_RESIZE_MIN_HEIGHT = 132;

type ReviewFormValues = z.input<typeof createReviewSchema>;

interface ReviewFormProps {
  onReviewSubmitted: () => void;
}

export function ReviewForm({onReviewSubmitted}: ReviewFormProps): React.JSX.Element {
  const [serviceOptions, setServiceOptions] = React.useState<ServiceOption[]>([]);
  const [languageOptions, setLanguageOptions] = React.useState<LanguageOption[]>([]);
  const [isReady, setIsReady] = React.useState(false);
  const [successVisible, setSuccessVisible] = React.useState(false);
  const reviewTextRef = React.useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    mode: "onChange",
    defaultValues: {
      customerName: "",
      email: "",
      languageCode: "en",
      language: "English",
      service: "Haircut",
      rating: 5,
      review: "",
      visitDate: DEFAULT_VISIT_DATE,
      tags: [],
    },
  });

  const rating = useWatch({control: form.control, name: "rating"});
  const reviewValue = useWatch({control: form.control, name: "review"});
  const customerNameValue = useWatch({control: form.control, name: "customerName"});
  const languageValue = useWatch({control: form.control, name: "languageCode"});
  const serviceValue = useWatch({control: form.control, name: "service"});
  const selectedTags = useWatch({control: form.control, name: "tags", defaultValue: [] as ReviewTag[]}) ?? [];

  React.useEffect(() => {
    let active = true;

    void import("@/components/reviews/review-data").then((module) => {
      if (!active) {
        return;
      }

      setServiceOptions(module.SERVICE_OPTIONS);
      const seed = getBrowserLanguageSeed();
      const options = buildLanguageOptions(seed.code);
      setLanguageOptions(options);

      const storedName = window.localStorage.getItem(NAME_STORAGE_KEY);
      if (storedName) {
        form.setValue("customerName", storedName, {shouldDirty: false, shouldTouch: false});
      }

      form.setValue("languageCode", seed.code, {shouldDirty: false, shouldTouch: false});
      form.setValue("language", seed.nativeName, {shouldDirty: false, shouldTouch: false});
      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [form]);

  React.useEffect(() => {
    if (rating < 5 && selectedTags.length > 0) {
      form.setValue("tags", [], {shouldDirty: true, shouldTouch: true});
    }
  }, [form, rating, selectedTags.length]);

  React.useEffect(() => {
    if (!reviewTextRef.current) {
      return;
    }

    reviewTextRef.current.style.height = "0px";
    reviewTextRef.current.style.height = `${Math.max(AUTO_RESIZE_MIN_HEIGHT, reviewTextRef.current.scrollHeight)}px`;
  }, [reviewValue]);

  React.useEffect(() => {
    if (customerNameValue) {
      window.localStorage.setItem(NAME_STORAGE_KEY, customerNameValue);
    }
  }, [customerNameValue]);

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as {success: boolean; data?: {id: string}; message?: string};

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message ?? "Failed to submit review.");
    }

    setSuccessVisible(true);
    form.reset({
      customerName: values.customerName,
      email: values.email,
      languageCode: values.languageCode,
      language: values.language,
      service: values.service,
      rating: 5,
      review: "",
      visitDate: DEFAULT_VISIT_DATE,
      tags: [],
    });
    onReviewSubmitted();

    window.setTimeout(() => setSuccessVisible(false), 3200);
  });

  const selectedService = serviceOptions.find((option) => option.value === serviceValue) ?? serviceOptions[0];
  const selectedLanguage = languageOptions.find((option) => option.code === languageValue) ?? languageOptions[0];
  const canSubmit = form.formState.isValid && !form.formState.isSubmitting;
  const reviewField = form.register("review");

  return (
    <motion.form
      onSubmit={(event) => void onSubmit(event)}
      className="relative overflow-hidden rounded-[28px] border border-border/70 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-6"
      initial={{opacity: 0, y: 22}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.15}}
      transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
      aria-label="Submit customer review"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Client feedback</p>
          <h3 className="type-h4 text-text">Share your experience</h3>
          <p className="type-small max-w-[56ch] text-muted">
            A smoother review flow with browser autofill, intelligent defaults, and subtle motion at every step.
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex">
          Premium form
        </Badge>
      </div>

      <AnimatePresence>
        {successVisible ? (
          <motion.div
            className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Your review was submitted for approval.</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Name" hint="Browser autofill and local memory" error={form.formState.errors.customerName?.message}>
          <Input
            autoComplete="name"
            placeholder="Your full name"
            {...form.register("customerName")}
            className={fieldClass(Boolean(form.formState.errors.customerName))}
          />
        </Field>

        <Field label="Email" hint="Validated as you type" error={form.formState.errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            {...form.register("email")}
            className={fieldClass(Boolean(form.formState.errors.email))}
          />
        </Field>

        <Field label="Language" hint="Auto-detected from your browser" error={form.formState.errors.language?.message}>
          <Controller
            control={form.control}
            name="languageCode"
            render={({field}) => (
              <SearchableLanguageCombobox
                options={languageOptions}
                value={field.value}
                onSelect={(option) => {
                  field.onChange(option.code);
                  form.setValue("language", option.nativeName, {shouldDirty: true, shouldValidate: true});
                }}
                selectedLanguage={selectedLanguage}
                disabled={!isReady}
              />
            )}
          />
        </Field>

        <Field label="Service" hint="Searchable combobox with icons" error={form.formState.errors.service?.message}>
          <Controller
            control={form.control}
            name="service"
            render={({field}) => (
              <SearchableServiceCombobox
                options={serviceOptions}
                value={field.value}
                onSelect={(option) => field.onChange(option.value)}
                selectedService={selectedService}
                disabled={!isReady}
              />
            )}
          />
        </Field>

        <Field label="Visit date" hint="Defaults to today" error={form.formState.errors.visitDate?.message} className="md:col-span-2">
          <Controller
            control={form.control}
            name="visitDate"
            render={({field}) => (
              <VisitDatePicker value={field.value ?? DEFAULT_VISIT_DATE} onChange={field.onChange} />
            )}
          />
        </Field>
      </div>

      <div className="mt-6 rounded-[24px] border border-border/70 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Rating</p>
            <h4 className="mt-1 type-h5 text-text">How would you rate the visit?</h4>
            <p className="type-small text-muted">Hover, tap, or use the keyboard to preview each star.</p>
          </div>
          <div className="rounded-full border border-border px-3 py-1.5 text-xs text-muted">
            {rating}/5 selected
          </div>
        </div>

        <Controller
          control={form.control}
          name="rating"
          render={({field}) => (
            <StarRatingField
              value={field.value}
              onChange={field.onChange}
              onCommit={(next) => form.setValue("rating", next, {shouldDirty: true, shouldValidate: true})}
            />
          )}
        />
      </div>

      <div className="mt-6 rounded-[24px] border border-border/70 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Review</p>
            <h4 className="mt-1 type-h5 text-text">Tell the story, not just the rating</h4>
            <p className="type-small text-muted">Minimum 20 characters. This stays future-ready for AI-assisted suggestions later.</p>
          </div>
          <div className="rounded-full border border-border px-3 py-1.5 text-xs text-muted">
            {reviewValue?.length ?? 0}/2000
          </div>
        </div>

        <Textarea
          rows={5}
          placeholder="What stood out? The cut, the flow, the atmosphere, the speed, or the attention to detail."
          {...reviewField}
          ref={(node) => {
            reviewTextRef.current = node;
            reviewField.ref(node);
          }}
          className={cn("mt-4 resize-none rounded-2xl bg-background/70", fieldClass(Boolean(form.formState.errors.review)))}
        />
        {form.formState.errors.review?.message ? (
          <p className="mt-2 text-sm text-rose-200">{form.formState.errors.review.message}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">A clear review helps other clients decide with confidence.</p>
        )}

        <div className="mt-4 rounded-2xl border border-border bg-background/70 p-4">
          <div className="flex items-center gap-2 text-sm text-text">
            <Wand2 className="h-4 w-4 text-muted" aria-hidden="true" />
            <span>Future-ready for AI suggestions</span>
          </div>
          <p className="mt-2 type-small text-muted">
            The form already has the structure needed for assisted drafting, without locking you into it yet.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {rating === 5 ? (
          <motion.div
            className="mt-6 rounded-[24px] border border-border/70 bg-white/[0.03] p-4 sm:p-5"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: 0.22}}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">What impressed you the most?</p>
                <h4 className="mt-1 type-h5 text-text">Select every tag that applies</h4>
                <p className="type-small text-muted">These tags will be stored with the review and surfaced inside the review cards.</p>
              </div>
              <Sparkles className="mt-1 h-5 w-5 text-muted" aria-hidden="true" />
            </div>

            <Controller
              control={form.control}
              name="tags"
              render={({field}) => (
                (() => {
                  const activeTags = field.value ?? [];

                  return (
                <div className="mt-4 flex flex-wrap gap-2">
                  {REVIEW_TAG_OPTIONS.map((tag) => {
                    const isSelected = activeTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? activeTags.filter((item) => item !== tag.value)
                            : [...activeTags, tag.value];
                          field.onChange(next);
                        }}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground shadow-[0_8px_20px_rgba(0,0,0,0.24)]"
                            : "border-border bg-background/80 text-muted hover:border-white/25 hover:text-text",
                        )}
                        aria-pressed={isSelected}
                      >
                        {tag.value === "Fast Service" ? <Loader2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
                  );
                })()
              )}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 space-y-3 border-t border-border/60 pt-5">
        <AnimatePresence>
          {form.formState.errors.root?.message ? (
            <motion.div
              className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
              initial={{opacity: 0, y: 8}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: 8}}
            >
              {form.formState.errors.root.message}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="sticky bottom-4 z-10 rounded-[22px] border border-border/70 bg-background/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur md:static md:bottom-auto md:z-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" isLoading={form.formState.isSubmitting} disabled={!canSubmit}>
            {form.formState.isSubmitting ? "Submitting review..." : "Submit review"}
          </Button>
        </div>
      </div>
    </motion.form>
  );
}

function fieldClass(hasError: boolean): string {
  return cn(
    "border-border/70 bg-background/70 text-text placeholder:text-muted",
    "focus:border-white/35 focus:ring-2 focus:ring-white/10",
    hasError && "border-rose-300/50 focus:border-rose-200/60 focus:ring-rose-300/20",
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs uppercase tracking-[0.16em] text-muted">{label}</label>
        <span className="type-caption text-muted/80 normal-case tracking-[0.1em]">{hint}</span>
      </div>
      {children}
      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  );
}

function SearchableLanguageCombobox({
  options,
  value,
  onSelect,
  selectedLanguage,
  disabled,
}: {
  options: LanguageOption[];
  value: string;
  onSelect: (option: LanguageOption) => void;
  selectedLanguage?: LanguageOption;
  disabled?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const label = selectedLanguage ? `${selectedLanguage.nativeName} (${selectedLanguage.label})` : "Select a language";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 text-left text-sm text-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <span className={cn("truncate", !value && "text-muted")}>{label}</span>
          <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-50 w-[min(92vw,32rem)] rounded-2xl border border-border bg-surface p-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <Command>
          <CommandInput placeholder="Search languages" />
          <CommandList>
            <CommandEmpty>No matching language.</CommandEmpty>
            <CommandGroup heading="Languages">
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={`${option.label} ${option.nativeName}`}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">
                    <span className="block text-sm text-text">{option.nativeName}</span>
                    <span className="block text-xs text-muted">{option.label}</span>
                  </span>
                  {option.code === value ? <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SearchableServiceCombobox({
  options,
  value,
  onSelect,
  selectedService,
  disabled,
}: {
  options: ServiceOption[];
  value: ReviewService;
  onSelect: (option: ServiceOption) => void;
  selectedService?: ServiceOption;
  disabled?: boolean;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 text-left text-sm text-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedService ? <selectedService.icon className="h-4 w-4 text-muted" aria-hidden="true" /> : null}
            <span className={cn("truncate", !value && "text-muted")}>{selectedService?.label ?? "Select a service"}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-50 w-[min(92vw,32rem)] rounded-2xl border border-border bg-surface p-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <Command>
          <CommandInput placeholder="Search services" />
          <CommandList>
            <CommandEmpty>No matching service.</CommandEmpty>
            <CommandGroup heading="Services">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.description}`}
                    onSelect={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                      <Icon className="h-4 w-4 text-text" aria-hidden="true" />
                    </span>
                    <span className="ml-3 flex-1 text-left">
                      <span className="block text-sm text-text">{option.label}</span>
                      <span className="block text-xs text-muted">{option.description}</span>
                    </span>
                    {option.value === value ? <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" /> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function VisitDatePicker({value, onChange}: {value: string; onChange: (value: string) => void}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const date = React.useMemo(() => {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 text-left text-sm text-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted" aria-hidden="true" />
            <span>{format(date, "EEEE, d MMMM yyyy")}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-50 w-[min(94vw,24rem)] rounded-2xl border border-border bg-surface p-0 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => {
            if (next) {
              onChange(format(next, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function StarRatingField({
  value,
  onChange,
  onCommit,
}: {
  value: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}): React.JSX.Element {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div
      className="mt-5 flex items-center gap-1"
      role="radiogroup"
      aria-label="Review rating"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = Math.min(5, value + 1);
          onChange(next);
          onCommit(next);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          const next = Math.max(1, value - 1);
          onChange(next);
          onCommit(next);
        }
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = displayValue >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} stars`}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            onFocus={() => setHoverValue(star)}
            onBlur={() => setHoverValue(null)}
            onClick={() => {
              onChange(star);
              onCommit(star);
            }}
            className="rounded-xl p-1.5 transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-all duration-200",
                active ? "fill-[#f4cb63] text-[#f4cb63] drop-shadow-[0_0_10px_rgba(244,203,99,0.35)]" : "text-white/25",
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-muted">{displayValue.toFixed(1)}</span>
    </div>
  );
}
