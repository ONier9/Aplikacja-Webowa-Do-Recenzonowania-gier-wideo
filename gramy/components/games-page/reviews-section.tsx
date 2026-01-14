import { useEffect } from 'react';
import ReviewList from '@/components/reviews/review-list';
import ReviewForm from '@/components/reviews/review-form';
import ReviewPagination from '@/components/reviews/review-pagination';
import { useGameReviews } from '@/hooks/useGameReviews';
import { useReviewPagination } from '@/hooks/useReviewPagination';
import { ReviewWithUser } from '@/types/';

interface ReviewsSectionProps {
  gameId: number;
  initialReviews: ReviewWithUser[];
  totalReviews: number;
  totalPages: number;
  initialUserReview: ReviewWithUser | null;
  initialAverageScore: number | null;
  currentUser: any;
  isAuthReady: boolean;
  onLoginRequired: () => void;
  onAverageScoreChange: (newScore: number | null) => void;
}

export default function ReviewsSection({
  gameId,
  initialReviews,
  totalReviews,
  totalPages,
  initialUserReview,
  initialAverageScore,
  currentUser,
  isAuthReady,
  onLoginRequired,
  onAverageScoreChange,
}: ReviewsSectionProps) {
  const {
    reviews,
    reviewsTotal,
    userReview,
    avgScore,
    isSubmitting,
    fetchReviews,
    handleReviewSubmit,
    handleReviewDelete,
    handleLikeToggle,
  } = useGameReviews({
    gameId,
    initialReviews,
    initialTotalReviews: totalReviews,
    initialUserReview,
    initialAverageScore,
    currentUser,
    onLoginRequired,
  });

  const {
    currentPage,
    sortBy,
    reviewsSectionRef,
    handleSortChange,
    handlePageChange,
    setPage,
  } = useReviewPagination({
    gameId,
    onPageChange: (page, sort) => fetchReviews(page, sort, currentUser?.id),
    onSortChange: (sort) => fetchReviews(1, sort, currentUser?.id),
  });

  useEffect(() => {
    onAverageScoreChange(avgScore);
  }, [avgScore, onAverageScoreChange]);

const onSubmit = async (rating: number, reviewText: string) => {
  await handleReviewSubmit(rating, reviewText);
  fetchReviews(1, 'created_at', currentUser?.id);
};

  if (!isAuthReady) {
    return (
      <div className="pt-8">
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8" ref={reviewsSectionRef}>
      <ReviewForm
        gameId={gameId}
        userReview={userReview}
        onSubmit={onSubmit}
        onDelete={handleReviewDelete}
        currentUser={currentUser}
        isSubmitting={isSubmitting}
      />

      <div className="bg-black/70 p-6 rounded-lg shadow-lg">
        <ReviewList
          reviews={reviews}
          totalReviews={reviewsTotal}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onLikeToggle={handleLikeToggle}
          currentUser={currentUser}
        />
      </div>

      {totalPages > 1 && (
        <ReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
