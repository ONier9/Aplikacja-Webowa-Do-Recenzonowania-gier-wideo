"use client";

import { useState } from "react";
import { ReviewWithUser } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useReviewLike } from "@/hooks/useReviewLike";
import { ReviewsHeader } from "@/components/reviews-page/reviews-header";
import { SortControls } from "@/components/reviews-page/sort-controls";
import { ReviewCard } from "@/components/reviews-page/review-card";
import { EmptyReviews } from "@/components/reviews-page/empty-reviews";
import { Pagination } from "@/components/reviews-page/pagination";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface UserReviewsClientProps {
  userProfile: UserProfile;
  reviews: ReviewWithUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  sortBy: "created_at" | "likes" | "rating";
}

export default function UserReviewsClient({
  userProfile,
  reviews: initialReviews,
  totalCount,
  currentPage,
  totalPages,
  sortBy,
}: UserReviewsClientProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const { toggleLike } = useReviewLike({
    currentUserId: user?.id,
  });

  const handleSortChange = (newSortBy: string) => {
    window.location.href = `/profile/${userProfile.username}/reviews?page=1&sortBy=${newSortBy}`;
  };

  const handlePageChange = (page: number) => {
    window.location.href = `/profile/${userProfile.username}/reviews?page=${page}&sortBy=${sortBy}`;
  };

  const handleToggleLike = (reviewId: string, currentlyLiked: boolean) => {
    toggleLike(reviewId, currentlyLiked, setReviews);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ReviewsHeader username={userProfile.username} totalCount={totalCount} />
      
      <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={user?.id}
            onToggleLike={handleToggleLike}
          />
        ))}
      </div>

      {reviews.length === 0 && <EmptyReviews />}
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}