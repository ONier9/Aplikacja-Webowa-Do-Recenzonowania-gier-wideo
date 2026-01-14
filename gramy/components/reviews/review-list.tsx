"use client";
import ReviewItem from "./review-item";

interface ReviewListProps {
  reviews: any[];
  totalReviews: number;
  sortBy: "created_at" | "likes";
  onSortChange: (sort: "created_at" | "likes") => void;
  currentUser: any;
  onLikeToggle: (reviewId: string) => void;
}

export default function ReviewList({
  reviews = [], 
  totalReviews,
  sortBy,
  onSortChange,
  currentUser,
  onLikeToggle,
}: ReviewListProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-100">
          {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
        </h3>
        <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              sortBy === "created_at" 
                ? "bg-gray-700 text-white shadow-sm" 
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => onSortChange("created_at")}
          >
            Recent
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              sortBy === "likes" 
                ? "bg-gray-700 text-white shadow-sm" 
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => onSortChange("likes")}
          >
            Most Helpful
          </button>
        </div>
      </div>
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <p className="text-gray-400 text-lg">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              currentUserId={currentUser?.id || null}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}