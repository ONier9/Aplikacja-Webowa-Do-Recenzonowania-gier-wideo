
import { ReviewWithUser } from '@/types/';
import Link from 'next/link';
import { Heart, User } from 'lucide-react';

interface RecentReviewsListProps {
  reviews: ReviewWithUser[];
  onToggleLike?: (reviewId: string, liked: boolean) => void;
}

export default function RecentReviewsList({ reviews, onToggleLike }: RecentReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">

          <Link 
            href={`/game/${review.game_id}`}
            className="font-semibold text-lg hover:text-blue-400 transition-colors block mb-3"
          >
            {review.game_name}
          </Link>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {review.avatar_url ? (
                <img
                  src={review.avatar_url}
                  alt={`${review.username}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${review.username}`}
                    className="font-medium hover:text-blue-400 transition-colors"
                  >
                    {review.username}
                  </Link>
                  <span className="text-yellow-400 font-bold">{review.rating}/5</span>
                </div>
                
                <span className="text-sm text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                  {review.updated && ' (Updated)'}
                </span>
              </div>
              
              <p className="text-gray-300 mb-3 line-clamp-3">{review.review_text}</p>
              
              {onToggleLike && (
                <button
                  onClick={() => onToggleLike(review.id, review.likedByUser || false)}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
                >
                  <Heart
                    className={`w-4 h-4 ${review.likedByUser ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{review.likes}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}