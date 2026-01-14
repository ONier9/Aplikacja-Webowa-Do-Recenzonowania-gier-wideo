import { ReviewWithUser } from "@/types/";
import { RawReview } from "./repository";

export function transformReview(
  rawReview: RawReview,
  userLikes: Set<string> = new Set()
): ReviewWithUser {
  return {
    id: rawReview.id,
    rating: rawReview.rating,
    review_text: rawReview.review_text,
    created_at: rawReview.created_at,
    updated_at: rawReview.updated_at,
    user_id: rawReview.user_id,
    game_id: rawReview.game_id,
    likes: rawReview.likes,
    updated: new Date(rawReview.updated_at) > new Date(rawReview.created_at),
    username: rawReview.profiles?.username || "Unknown",
    avatar_url: rawReview.profiles?.avatar_url || null,
    likedByUser: userLikes.has(rawReview.id),
    game_name: null,
    game_cover_url: null,
  };
}
export function transformReviews(
  rawReviews: RawReview[],
  userLikes: Set<string> = new Set()
): ReviewWithUser[] {
  return rawReviews.map(review => transformReview(review, userLikes));
}

export function calculatePaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function formatAverageScore(score: number | null): string | null {
  return score ? score.toFixed(1) : null;
}