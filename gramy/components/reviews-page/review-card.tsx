"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ReviewWithUser } from "@/types";
import { GameCoverImage } from "./game-cover-image";

interface ReviewCardProps {
  review: ReviewWithUser;
  currentUserId?: string;
  onToggleLike: (reviewId: string, currentlyLiked: boolean) => void;
}

export function ReviewCard({ review, currentUserId, onToggleLike }: ReviewCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
      <div className="flex gap-6">
        <GameCoverImage 
          gameId={review.game_id}
          coverUrl={review.game_cover_url}
          gameName={review.game_name}
        />
        
        <div className="flex-1 min-w-0">
          <ReviewHeader review={review} />
          <ReviewText text={review.review_text} />
        </div>
      </div>
    </div>
  );
}

function ReviewHeader({ review }: { review: ReviewWithUser }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <Link
          href={`/game/${review.game_id}`}
          className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
        >
          {review.game_name}
        </Link>
        <ReviewMetadata review={review} />
      </div>
    </div>
  );
}

function ReviewMetadata({ review }: { review: ReviewWithUser }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 font-bold text-lg">
          {review.rating}
        </span>
        <span className="text-gray-400 text-sm">/5</span>
      </div>
      <span className="text-gray-500">•</span>
      <span className="text-sm text-gray-400">
        {new Date(review.created_at).toLocaleDateString()}
      </span>
      {review.updated && (
        <>
          <span className="text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            Edited {new Date(review.updated_at).toLocaleDateString()}
          </span>
        </>
      )}
    </div>
  );
}

function ReviewText({ text }: { text: string }) {
  return (
    <p className="text-gray-200 leading-relaxed mb-4">
      {text}
    </p>
  );
}

function LikeButton({ 
  review, 
  currentUserId, 
  onToggleLike,
  isLiking
}: { 
  review: ReviewWithUser;
  currentUserId?: string;
  onToggleLike: (reviewId: string, currentlyLiked: boolean) => void;
  isLiking?: boolean;
}) {
  return (
    <button
      onClick={() => onToggleLike(review.id, review.likedByUser || false)}
      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!currentUserId || isLiking}
    >
      <Heart
        className={`w-5 h-5 ${
          review.likedByUser ? "fill-red-500 text-red-500" : ""
        }`}
      />
      <span className="text-sm">{review.likes}</span>
    </button>
  );
}