'use server';

import { requireAuth } from '@/actions/utils/auth/context';
import { revalidateGamePath } from '@/actions/utils/revalidation/paths';
import type { ActionResult } from '@/types/common';
import type { Review } from '@/types/reviews';

interface ToggleReviewLikeResponse {
  likesCount?: number;
  isLiked?: boolean;
}

interface SubmitReviewResponse {
  review: Review;
}

export async function submitReview(
  gameId: number,
  rating: number,
  reviewText: string,
  existingReviewId?: string
): Promise<ActionResult<SubmitReviewResponse>> {
  try {
    const { supabase, user } = await requireAuth();
    let data;

    if (existingReviewId) {
      const { data: updated, error } = await supabase
        .from('reviews')
        .update({ rating, review_text: reviewText })
        .eq('id', existingReviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      data = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('reviews')
        .insert({ game_id: gameId, user_id: user.id, rating, review_text: reviewText })
        .select()
        .single();

      if (error) throw error;
      data = inserted;
    }

    await revalidateGamePath(gameId.toString());

    return { success: true, data: { review: data } };
  } catch (error) {
    console.error('[submitReview] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to submit review' };
  }
}

export async function deleteReview(
  reviewId: string,
  gameId: number
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAuth();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) throw error;

    await revalidateGamePath(gameId.toString());

    return { success: true };
  } catch (error) {
    console.error('[deleteReview] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete review' };
  }
}

export async function toggleReviewLike(
  reviewId: string,
  gameId: number
): Promise<ActionResult<ToggleReviewLikeResponse>> {
  try {
    const { supabase } = await requireAuth();

    const { data, error } = await supabase.rpc('toggle_review_like', { p_review_id: reviewId });
    if (error) throw error;

    await revalidateGamePath(gameId.toString());

    return { success: true, data: { likesCount: data.count, isLiked: data.is_liked } };
  } catch (error) {
    console.error('[toggleReviewLike] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to toggle like' };
  }
}
