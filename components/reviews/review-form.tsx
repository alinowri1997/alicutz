'use client';

import { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { validateMediaFile } from '@/lib/utils/upload';
import type { ReviewRating } from '@/lib/types/reviews';

interface ReviewFormProps {
  onReviewSubmitted: () => void;
}

export function ReviewForm({ onReviewSubmitted }: ReviewFormProps): React.JSX.Element {
  const [rating, setRating] = useState<ReviewRating>(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: File[] = [];

    for (const file of files) {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const validation = validateMediaFile(file, mediaType);

      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      newFiles.push(file);
    }

    setMedia([...media, ...newFiles]);
    setError('');
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // For now, submit review without media upload
      // Media upload will be implemented in the next phase
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: name,
          user_email: email,
          rating,
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setTitle('');
      setContent('');
      setRating(5);
      setMedia([]);

      setTimeout(() => {
        setSuccess(false);
        onReviewSubmitted();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h3 className="font-semibold text-text mb-6">Share Your Experience</h3>

      {success && (
        <div className="mb-4 p-3 rounded bg-accent/10 text-accent text-sm">
          ✓ Thank you! Your review has been submitted.
        </div>
      )}

      {error && <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="type-caption text-muted block mb-2" htmlFor="review-rating-group">Rating</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className="transition-transform hover:scale-110"
                id={r === 1 ? "review-rating-group" : undefined}
                aria-label={`Set rating to ${r} star${r > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 ${rating >= r ? 'fill-accent text-accent' : 'text-border'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="type-caption text-muted block mb-1" htmlFor="review-name">Name</label>
          <input
            id="review-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="type-caption text-muted block mb-1" htmlFor="review-email">Email</label>
          <input
            id="review-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Title */}
        <div>
          <label className="type-caption text-muted block mb-1" htmlFor="review-title">Review Title</label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Excellent experience"
            required
            className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Content */}
        <div>
          <label className="type-caption text-muted block mb-1" htmlFor="review-content">Your Review</label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience..."
            required
            minLength={20}
            maxLength={5000}
            rows={4}
            className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
          <p className="type-caption text-muted mt-1">{content.length}/5000</p>
        </div>

        {/* Media Upload */}
        <div>
          <label className="type-caption text-muted block mb-2" htmlFor="review-media-upload">Add Photos or Videos (Optional)</label>
          <div className="flex gap-2">
            <label className="flex-1 px-4 py-3 rounded border-2 border-dashed border-border hover:border-accent/50 cursor-pointer transition-colors flex items-center justify-center gap-2 text-muted hover:text-accent">
              <Upload className="h-4 w-4" />
              <span className="text-sm">Upload Media</span>
              <input
                id="review-media-upload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
          </div>

          {media.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {media.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="h-16 w-16 rounded bg-surface border border-border flex items-center justify-center text-xs text-muted truncate p-1">
                    {file.type.startsWith('image/') ? '🖼️' : '🎥'} {file.name.substring(0, 6)}...
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !name || !email || !title || !content}
          className="w-full py-2 px-4 rounded bg-accent text-background font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
