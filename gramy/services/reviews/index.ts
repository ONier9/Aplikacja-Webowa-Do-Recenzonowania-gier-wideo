
import { ReviewWithUser } from "@/types/";
import { reviewRepository } from "./repository";
import { transformReviews, transformReview, calculatePaginationRange, formatAverageScore } from "./helpers";

export const reviewService = {
  async getGameReviews(
    gameId: number,
    page: number = 1,
    pageSize: number = 3,
    sortBy: "created_at" | "likes" = "created_at",
    userId?: string | null
  ) {
    try {
      const { from, to } = calculatePaginationRange(page, pageSize);

      const [reviews, totalCount] = await Promise.all([
        reviewRepository.fetchGameReviews(gameId, from, to, sortBy),
        reviewRepository.countGameReviews(gameId),
      ]);

      let userLikes = new Set<string>();
      if (userId && reviews.length > 0) {
        const reviewIds = reviews.map((r) => r.id);
        userLikes = await reviewRepository.fetchUserLikes(userId, reviewIds);
      }

      return {
        reviews: transformReviews(reviews, userLikes),
        totalCount,
      };
    } catch (error) {
      console.error("[reviewService] Error fetching game reviews:", error);
      return { reviews: [], totalCount: 0 };
    }
  },

  async getUserReview(gameId: number, userId: string): Promise<ReviewWithUser | null> {
    try {
      const review = await reviewRepository.fetchUserReview(gameId, userId);
      if (!review) return null;

      return transformReview(review);
    } catch (error) {
      console.error("[reviewService] Error fetching user review:", error);
      return null;
    }
  },
  async submitReview(
    gameId: number,
    userId: string,
    rating: number,
    reviewText: string,
    existingReviewId?: string
  ) {
    try {
      if (existingReviewId) {
        return await reviewRepository.updateReview(existingReviewId, userId, rating, reviewText);
      } else {
        return await reviewRepository.insertReview(gameId, userId, rating, reviewText);
      }
    } catch (error) {
      console.error("[reviewService] Error submitting review:", error);
      throw error;
    }
  },

  async deleteReview(reviewId: string, userId: string) {
    try {
      await reviewRepository.deleteReview(reviewId, userId);
    } catch (error) {
      console.error("[reviewService] Error deleting review:", error);
      throw error;
    }
  },

  async getAverageScore(gameId: number) {
    try {
      const score = await reviewRepository.fetchAverageScore(gameId);
      return formatAverageScore(score);
    } catch (error) {
      console.error("[reviewService] Error fetching average score:", error);
      return null;
    }
  },
};