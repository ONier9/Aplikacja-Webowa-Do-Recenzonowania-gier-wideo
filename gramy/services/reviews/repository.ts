
import { supabase } from "../supabaseClient";

export interface RawReview {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  game_id: number;
  likes: number;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export const reviewRepository = {

  async fetchGameReviews(
    gameId: number,
    from: number,
    to: number,
    sortBy: "created_at" | "likes" = "created_at"
  ) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, rating, review_text, created_at, updated_at, user_id, game_id, likes,
        profiles:user_id(username, avatar_url)
      `
      )
      .eq("game_id", gameId)
      .order(sortBy, { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data as RawReview[];
  },

  async countGameReviews(gameId: number) {
    const { count, error } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (error) throw error;
    return count || 0;
  },

  async fetchUserLikes(userId: string, reviewIds: string[]) {
    if (reviewIds.length === 0) return new Set<string>();

    const { data, error } = await supabase
      .from("review_likes")
      .select("review_id")
      .eq("user_id", userId)
      .in("review_id", reviewIds);

    if (error) {
      console.error("[reviewRepository] Error fetching user likes:", error);
      return new Set<string>();
    }

    return new Set(data?.map((l) => l.review_id) || []);
  },

  async fetchUserReview(gameId: number, userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, rating, review_text, created_at, updated_at, user_id, game_id, likes,
        profiles:user_id(username, avatar_url)
      `
      )
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") {
        console.error("[reviewRepository] Error fetching user review:", error);
      }
      return null;
    }

    return data as RawReview;
  },


  async insertReview(gameId: number, userId: string, rating: number, reviewText: string) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({ game_id: gameId, user_id: userId, rating, review_text: reviewText })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, userId: string, rating: number, reviewText: string) {
    const { data, error } = await supabase
      .from("reviews")
      .update({ rating, review_text: reviewText })
      .eq("id", reviewId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string, userId: string) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId);

    if (error) throw error;
  },

 
  async fetchAverageScore(gameId: number) {
    const { data, error } = await supabase
      .from("game_average_scores")
      .select("average_rating")
      .eq("game_id", gameId)
      .maybeSingle();

    if (error) {
      console.error("[reviewRepository] Error fetching average score:", error);
      return null;
    }

    return data?.average_rating ? Number(data.average_rating) : null;
  },
};