'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { ReviewStats } from '@/components/reviews/review-stats';
import { ReviewsList } from '@/components/reviews/reviews-list';
import { ReviewForm } from '@/components/reviews/review-form';
import type { ReviewWithRelations } from '@/lib/types/reviews';

export function ReviewsSection(): React.JSX.Element {
  const [reviews, setReviews] = useState<ReviewWithRelations[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews?limit=5&sort_by=newest');
        const data = await response.json();

        if (data.success && data.data) {
          setReviews(data.data.reviews || []);

          // Calculate average rating
          if (data.data.reviews && data.data.reviews.length > 0) {
            const avg =
              data.data.reviews.reduce((sum: number, review: ReviewWithRelations) => sum + review.rating, 0) /
              data.data.reviews.length;
            setAverageRating(Math.round(avg * 10) / 10);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section aria-labelledby="reviews-heading" className="py-16 sm:py-20 md:py-24 bg-surface">
      <Container className="space-y-12">
        <div className="space-y-3">
          <p className="type-caption text-muted">Client Experiences</p>
          <Heading id="reviews-heading" as="h2" size="h2" className="text-balance text-text">
            Trusted by Premium Clients
          </Heading>
        </div>

        <ReviewStats averageRating={averageRating} totalReviews={reviews.length} isLoading={isLoading} />

        <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
          <ReviewsList reviews={reviews} isLoading={isLoading} />
          <ReviewForm onReviewSubmitted={() => window.location.reload()} />
        </div>
      </Container>
    </section>
  );
}
