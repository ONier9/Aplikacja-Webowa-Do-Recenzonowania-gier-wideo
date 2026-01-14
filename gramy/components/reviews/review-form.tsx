"use client";

import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { deleteReview } from "@/actions/reviews";

interface ReviewFormProps {
  gameId: number;
  userReview: any | null;
  onSubmit: (rating: number, reviewText: string) => void;
  onDelete: () => void;
  currentUser: any;
  isSubmitting?: boolean;
}

export default function ReviewForm({
  gameId,
  userReview,
  onSubmit,
  onDelete,
  currentUser,
  isSubmitting = false,
}: ReviewFormProps) {
  const { openLogin } = useModal();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text || "");
    }
  }, [userReview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLogin();
      return;
    }
    if (rating === 0) return;
    onSubmit(rating, reviewText);
  };

  const handleDelete = async () => {
    if (!currentUser || !userReview) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteReview(userReview.id, currentUser.id, gameId);
      if (result.success) {
        setRating(0);
        setReviewText("");
        onDelete();
      } else {
        alert(result.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-gray-800/40 p-6 rounded-lg shadow-lg border border-gray-700/50 mb-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">
        {userReview ? "Your Review" : "Write a Review"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Rating {rating > 0 && <span className="text-yellow-400">({rating} stars)</span>}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className="relative w-10 h-10 cursor-pointer transition-transform hover:scale-110"
                onMouseLeave={() => setHoverRating(0)}
              >
                <div
                  className="absolute left-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => setHoverRating(star - 0.5)}
                  onClick={() => setRating(star - 0.5)}
                />
                <div
                  className="absolute right-0 top-0 w-1/2 h-full z-10"
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                />

                <Star className="w-10 h-10 text-gray-600" />

                {displayRating >= star - 0.5 && displayRating < star && (
                  <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                    <Star className="w-10 h-10 fill-yellow-400 text-yellow-400" />
                  </div>
                )}
                {displayRating >= star && (
                  <Star className="absolute top-0 left-0 w-10 h-10 fill-yellow-400 text-yellow-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Your Review (Optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this game..."
            className="w-full p-4 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all min-h-[140px] resize-none"
            disabled={isSubmitting || isDeleting}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting || isDeleting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isSubmitting
              ? "Submitting..."
              : userReview
              ? "Update Review"
              : "Submit Review"}
          </button>

          {userReview && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="px-6 py-2.5 bg-red-600/90 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Review"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}