'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await fetch('/api/reviews?limit=5&sort_by=newest');
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (data.success && data.data) {
          const nextReviews = data.data.reviews || [];
          setReviews(nextReviews);

          if (nextReviews.length > 0) {
            const avg =
              nextReviews.reduce((sum: number, review: ReviewWithRelations) => sum + review.rating, 0) /
              nextReviews.length;
            setAverageRating(Math.round(avg * 10) / 10);
          } else {
            setAverageRating(0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="py-16 sm:py-20 md:py-24 bg-surface">
      <Container className="space-y-12">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="type-caption text-muted">Client Experiences</p>
          <Heading id="reviews-heading" as="h2" size="h2" className="text-balance text-text">
            Trusted by Premium Clients
          </Heading>
        </motion.div>

        <ReviewStats averageRating={averageRating} totalReviews={reviews.length} isLoading={isLoading} />

        <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
          <ReviewsList reviews={reviews} isLoading={isLoading} />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <ReviewForm onReviewSubmitted={() => setRefreshKey((current) => current + 1)} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
