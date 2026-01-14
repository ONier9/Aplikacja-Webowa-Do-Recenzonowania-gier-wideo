
"use client";

import { useState, useTransition } from "react";
import { followUser, unfollowUser } from "@/actions/followActions";
import { UserPlus, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ 
  targetUserId, 
  targetUsername,
  initialIsFollowing 
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    
    startTransition(async () => {
      try {
        const result = isFollowing 
          ? await unfollowUser(targetUserId)
          : await followUser(targetUserId);
        
        if (!result.success) {
          setIsFollowing(previousState);
          console.error("Follow action failed:", result.error);
        } else {
          router.refresh();
        }
      } catch (error) {
        setIsFollowing(previousState);
        console.error("Error updating follow status:", error);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full font-medium 
        transition-all duration-200 shadow-lg
        ${
          isFollowing
            ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-red-500"
            : "bg-teal-500 hover:bg-teal-600 text-white border border-teal-400"
        }
        ${isPending ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>...</span>
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}