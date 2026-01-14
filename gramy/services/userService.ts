import { SimpleGame } from "@/components/page-elements/game-grid";
import { supabase } from "./supabaseClient";
import { ReviewWithUser } from "@/types/";

export const userService = {
  async getUserProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserReviews(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: "created_at" | "likes" | "rating" = "created_at"
  ): Promise<ReviewWithUser[]> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: reviews } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles!reviews_user_id_profiles_fkey (username, avatar_url),
        games!reviews_game_id_fkey (name, cover_url)
      `)
      .eq("user_id", userId)
      .order(sortBy, { ascending: false })
      .range(from, to);

    if (!reviews) return [];

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    let likedReviewIds: string[] = [];
    if (currentUserId && reviews.length > 0) {
      const reviewIds = reviews.map((r: any) => r.id);
      const { data: likes } = await supabase
        .from("review_likes")
        .select("review_id")
        .eq("user_id", currentUserId)
        .in("review_id", reviewIds);
      likedReviewIds = likes?.map(l => l.review_id) || [];
    }

    return reviews.map((review: any) => {
      const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
      const game = Array.isArray(review.games) ? review.games[0] : review.games;

      return {
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        created_at: review.created_at,
        updated_at: review.updated_at,
        user_id: review.user_id,
        game_id: review.game_id,
        likes: review.likes,
        updated: review.updated,
        username: profile?.username || "Unknown",
        avatar_url: profile?.avatar_url || null,
        game_name: game?.name || "Unknown Game",
        game_cover_url: game?.cover_url || null,
        likedByUser: likedReviewIds.includes(review.id),
      };
    });
  },

  async getUserRecentReviews(userId: string, limit: number = 5): Promise<ReviewWithUser[]> {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        review_text,
        created_at,
        updated_at,
        user_id,
        game_id,
        likes,
        updated,
        games!inner (name, cover_url),
        profiles!inner (username, avatar_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (reviews || []).map((review: any) => ({
      id: review.id,
      rating: review.rating,
      review_text: review.review_text,
      created_at: review.created_at,
      updated_at: review.updated_at,
      user_id: review.user_id,
      game_id: review.game_id,
      likes: review.likes,
      updated: review.updated,
      username: review.profiles?.username || "Unknown",
      avatar_url: review.profiles?.avatar_url || null,
      game_name: review.games?.name || "Unknown Game",
      game_cover_url: review.games?.cover_url || null,
      likedByUser: false,
    }));
  },

  async getUserReviewsCount(userId: string) {
    const { count, error } = await supabase
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("user_id", userId);
    if (error) throw error;
    return count || 0;
  },

  async getUserRatingDistribution(userId: string) {
    const { data } = await supabase
      .from("reviews")
      .select("rating")
      .eq("user_id", userId);

    const distribution = {
      "0.5": 0, "1.0": 0, "1.5": 0, "2.0": 0, "2.5": 0,
      "3.0": 0, "3.5": 0, "4.0": 0, "4.5": 0, "5.0": 0,
    };

    if (!data || data.length === 0) return { distribution, averageRating: "N/A" };

    data.forEach((review) => {
      const rating = Number(review.rating).toFixed(1);
      if (distribution.hasOwnProperty(rating)) distribution[rating as keyof typeof distribution]++;
    });

    const total = data.reduce((acc, review) => acc + Number(review.rating), 0);
    const averageRating = (total / data.length).toFixed(1);

    return { distribution, averageRating };
  },

  async getUserTopFavoriteGames(userId: string, limit: number = 5): Promise<SimpleGame[]> {
    const { data, error } = await supabase
      .from("user_favorite_games")
      .select(`
        id,
        is_top_favorite,
        games!inner (igdb_id, name, cover_url)
      `)
      .eq("user_id", userId)
      .eq("is_top_favorite", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      igdb_id: item.games.igdb_id,
      name: item.games.name,
      cover_url: item.games.cover_url,
      favorite_id: item.id,
    }));
  },

  async getUserAllFavorites(userId: string): Promise<SimpleGame[]> {
    const { data, error } = await supabase
      .from("user_favorite_games")
      .select(`
        id,
        is_top_favorite,
        games!inner (igdb_id, name, cover_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      igdb_id: item.games.igdb_id,
      name: item.games.name,
      cover_url: item.games.cover_url,
      favorite_id: item.id,
      is_top_favorite: item.is_top_favorite,
    }));
  },

  async favoriteGame(userId: string, gameId: number, addToTop: boolean = false): Promise<string> {
    const { data: existing } = await supabase
      .from("user_favorite_games")
      .select("id, is_top_favorite")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .single();

    if (existing) {
      if (addToTop && !existing.is_top_favorite) {
        await this.addToTopFavorites(userId, existing.id);
      }
      return existing.id;
    }

    if (addToTop) {
      const { count } = await supabase
        .from("user_favorite_games")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_top_favorite", true);

      if (count && count >= 5) throw new Error("Maximum 5 top favorites allowed");
    }

    const { data, error } = await supabase
      .from("user_favorite_games")
      .insert({ user_id: userId, game_id: gameId, is_top_favorite: addToTop })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async addToTopFavorites(userId: string, favoriteId: string): Promise<void> {
    const { count } = await supabase
      .from("user_favorite_games")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_top_favorite", true);

    if (count && count >= 5) throw new Error("Maximum 5 top favorites allowed");

    const { error } = await supabase
      .from("user_favorite_games")
      .update({ is_top_favorite: true })
      .eq("id", favoriteId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async removeFromTopFavorites(userId: string, favoriteId: string): Promise<void> {
    const { error } = await supabase
      .from("user_favorite_games")
      .update({ is_top_favorite: false })
      .eq("id", favoriteId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async toggleTopFavorite(userId: string, favoriteId: string): Promise<boolean> {
    const { data: current } = await supabase
      .from("user_favorite_games")
      .select("is_top_favorite")
      .eq("id", favoriteId)
      .eq("user_id", userId)
      .single();

    if (!current) throw new Error("Favorite not found");

    if (current.is_top_favorite) {
      await this.removeFromTopFavorites(userId, favoriteId);
      return false;
    } else {
      await this.addToTopFavorites(userId, favoriteId);
      return true;
    }
  },
};
