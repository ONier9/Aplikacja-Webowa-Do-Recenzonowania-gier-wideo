import { useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { Heart } from "lucide-react";

export default function LikeButton({ 
  reviewId, 
  initialLikes, 
  initiallyLiked 
}: {
  reviewId: string;
  initialLikes: number;
  initiallyLiked: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);

  const toggleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    if (liked) {
      await supabase
        .from("review_likes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", session.user.id);

      setLikes(likes - 1);
      setLiked(false);
    } else {
      await supabase
        .from("review_likes")
        .insert({ review_id: reviewId, user_id: session.user.id });

      setLikes(likes + 1);
      setLiked(true);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
    >
      <Heart
        className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span>{likes}</span>
    </button>
  );
}