"use client";
import { useState, useTransition } from "react";
import { Heart, UserCircle, Star } from "lucide-react";

interface ReviewItemProps {
  review: any;
  currentUserId?: string | null;
  onLikeToggle: (reviewId: string, newLikesCount: number, newIsLiked: boolean) => void;
}

export default function ReviewItem({
  review,
  currentUserId,
  onLikeToggle,
}: ReviewItemProps) {
  const isOwnReview = review.user_id === currentUserId;
  const avatarUrl = review.avatar_url || null;
  const createdDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const updated =
    review.updated_at &&
    review.updated_at !== review.created_at &&
    new Date(review.updated_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const [localLikes, setLocalLikes] = useState(review.likes);
  const [localIsLiked, setLocalIsLiked] = useState(review.likedByUser);
  const [isPending, startTransition] = useTransition();

  const handleLikeClick = () => {
    if (isPending) return;
    const newIsLiked = !localIsLiked;
    const newLikesCount = newIsLiked ? localLikes + 1 : localLikes - 1;
    
    setLocalIsLiked(newIsLiked);
    setLocalLikes(newLikesCount);
    startTransition(() => {
      onLikeToggle(review.id, newLikesCount, newIsLiked);
    });
  };

  return (
    <div className="bg-gray-800/40 rounded-lg p-5 mb-4 hover:bg-gray-800/60 transition-colors border border-gray-700/50">
      <div className="flex items-start justify-between mb-3">
        <a 
          href={`/profile/${review.username}`}
          className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={review.username} 
              className="w-10 h-10 rounded-full ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-gray-700 group-hover:ring-gray-600 transition-all">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-100 group-hover:text-white transition-colors">
              {review.username}
            </span>
            <div className="text-xs text-gray-400 mt-0.5">
              {createdDate}
              {updated && <span className="ml-1">(edited {updated})</span>}
            </div>
          </div>
        </a>

        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="relative w-5 h-5">
              <Star className="w-5 h-5 text-gray-600" />
              {review.rating >= star - 0.5 && review.rating < star && (
                <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
              {review.rating >= star && (
                <Star className="absolute top-0 left-0 w-5 h-5 fill-yellow-400 text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-200 leading-relaxed mb-3 pl-13">{review.review_text}</p>

        <div className="flex justify-end pl-13">
          <button
            onClick={handleLikeClick}
            disabled={isPending}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              localIsLiked 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                localIsLiked ? "fill-red-400" : ""
              }`}
            />
            <span>{localLikes}</span>
          </button>
        </div>
    </div>
  );
}
