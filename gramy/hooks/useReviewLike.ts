import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { ReviewWithUser } from '@/types';

interface UseReviewLikeOptions {
  currentUserId?: string;
  onLoginRequired?: () => void;
}

export function useReviewLike({ currentUserId, onLoginRequired }: UseReviewLikeOptions = {}) {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, boolean>>(new Map());

  const toggleLike = useCallback(
    async (reviewId: string, currentlyLiked: boolean, updateReviews: (updater: (reviews: ReviewWithUser[]) => ReviewWithUser[]) => void) => {
      if (!currentUserId) {
        onLoginRequired?.();
        return;
      }

      updateReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? {
                ...r,
                likes: r.likes + (currentlyLiked ? -1 : 1),
                likedByUser: !currentlyLiked
              }
            : r
        )
      );

      try {
        if (currentlyLiked) {
          await supabase
            .from("review_likes")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", currentUserId);
        } else {
          await supabase
            .from("review_likes")
            .upsert(
              { review_id: reviewId, user_id: currentUserId },
              { onConflict: 'review_id,user_id', ignoreDuplicates: true }
            );
        }
      } catch (error) {
        console.error('[useReviewLike] Failed to toggle like:', error);

        updateReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? {
                  ...r,
                  likes: r.likes + (currentlyLiked ? 1 : -1),
                  likedByUser: currentlyLiked
                }
              : r
          )
        );
      }
    },
    [currentUserId, onLoginRequired]
  );

  return { toggleLike };
}