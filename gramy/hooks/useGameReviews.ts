import { useState, useCallback } from 'react';
import { ReviewWithUser } from '@/types/';
import { reviewService } from '@/services/reviews';
import { toggleReviewLike } from '@/actions/reviews/reviews';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface UseGameReviewsOptions {
  gameId: number;
  initialReviews: ReviewWithUser[];
  initialTotalReviews: number;
  initialUserReview: ReviewWithUser | null;
  initialAverageScore: number | null;
  currentUser: any;
  onLoginRequired: () => void;
}

export function useGameReviews({
  gameId,
  initialReviews,
  initialTotalReviews,
  initialUserReview,
  initialAverageScore,
  currentUser,
  onLoginRequired,
}: UseGameReviewsOptions) {
const [reviews, setReviews] = useState<ReviewWithUser[]>(initialReviews || []);
  const [reviewsTotal, setReviewsTotal] = useState(initialTotalReviews);
  const [userReview, setUserReview] = useState<ReviewWithUser | null>(initialUserReview);
  const [avgScore, setAvgScore] = useState(initialAverageScore);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserReview = useCallback(
    async (userId: string) => {
      try {
        const review = await reviewService.getUserReview(gameId, userId);
        setUserReview(review);
      } catch (err) {
        console.error('[useGameReviews] Failed to fetch user review:', err);
      }
    },
    [gameId]
  );

  const fetchReviews = useCallback(
    async (page: number, sort: 'created_at' | 'likes', userId?: string) => {
      try {
        const { reviews: fetchedReviews, totalCount } = await reviewService.getGameReviews(
          gameId,
          page,
          3,
          sort,
          userId
        );
        setReviews(fetchedReviews);
        setReviewsTotal(totalCount);
      } catch (err) {
        console.error('[useGameReviews] Failed to fetch reviews:', err);
      }
    },
    [gameId]
  );

  const refreshAverageScore = useCallback(async () => {
    try {
      const newAvg = await reviewService.getAverageScore(gameId);
      setAvgScore(newAvg);
    } catch (err) {
      console.error('[useGameReviews] Failed to refresh average score:', err);
    }
  }, [gameId]);

  const handleReviewSubmit = useCallback(
    async (rating: number, reviewText: string) => {
      if (!currentUser) {
        onLoginRequired();
        return;
      }
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const newReview = await reviewService.submitReview(
          gameId,
          currentUser.id,
          rating,
          reviewText,
          userReview?.id
        );

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser.id)
          .single();

        const updatedReview: ReviewWithUser = {
          ...newReview,
          username: profile?.username || 'You',
          avatar_url: profile?.avatar_url || null,
          likedByUser: false,
          updated: new Date(newReview.updated_at) > new Date(newReview.created_at),
          game_name: null,
          game_cover_url: null,
        };

        setUserReview(updatedReview);

        setReviews(prev => {
          const others = prev.filter(r => r.user_id !== currentUser.id);
          return [updatedReview, ...others];
        });

        if (!userReview) setReviewsTotal(prev => prev + 1);

        await refreshAverageScore();
      } catch (err) {
        console.error('[useGameReviews] Failed to submit review:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentUser, gameId, userReview?.id, onLoginRequired, isSubmitting, refreshAverageScore]
  );

  const handleReviewDelete = useCallback(async () => {
    if (!userReview || !currentUser) return;

    try {
      await reviewService.deleteReview(userReview.id, currentUser.id, gameId);

      setReviews(prev => prev.filter(r => r.id !== userReview.id));
      setUserReview(null);
      setReviewsTotal(prev => prev - 1);

      await refreshAverageScore();
    } catch (err) {
      console.error('[useGameReviews] Failed to delete review:', err);
      alert('Failed to delete review');
    }
  }, [userReview, currentUser, gameId, refreshAverageScore]);

  const handleLikeToggle = useCallback(
    async (reviewId: string, optimisticCount: number, optimisticIsLiked: boolean) => {
      if (!currentUser) {
        onLoginRequired();
        return;
      }

      try {
        const result = await toggleReviewLike(reviewId, gameId);
        
        if (result.success && result.data) {
          setReviews(prev =>
            prev.map(r =>
              r.id === reviewId
                ? {
                    ...r,
                    likes: result.data!.likesCount ?? optimisticCount,
                    likedByUser: result.data!.isLiked ?? optimisticIsLiked
                  }
                : r
            )
          );
        } else {
          setReviews(prev =>
            prev.map(r =>
              r.id === reviewId
                ? {
                    ...r,
                    likes: optimisticIsLiked ? optimisticCount - 1 : optimisticCount + 1,
                    likedByUser: !optimisticIsLiked
                  }
                : r
            )
          );
        }
      } catch (err) {
        console.error('[useGameReviews] Like toggle error:', err);
        setReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? {
                  ...r,
                  likes: optimisticIsLiked ? optimisticCount - 1 : optimisticCount + 1,
                  likedByUser: !optimisticIsLiked
                }
              : r
          )
        );
      }
    },
    [currentUser, gameId, onLoginRequired]
  );

  return {
    reviews,
    reviewsTotal,
    userReview,
    avgScore,
    isSubmitting,
    fetchReviews,
    fetchUserReview,
    handleReviewSubmit,
    handleReviewDelete,
    handleLikeToggle,
  };