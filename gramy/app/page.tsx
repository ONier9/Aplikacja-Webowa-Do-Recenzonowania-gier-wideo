import { createClient } from "@/utils/supabase/server";
import GameCarousel from "@/components/page-elements/game-carousel";
import { Game } from "@/types/";
import { GameCover } from "@/components/page-elements/game-cover";
import Link from "next/link";
import UserGreeting from "@/components/page-elements/user-greeting";
import Image from "next/image";
import { UserCircle } from "lucide-react";

export default async function MainPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data: games } = await supabase
    .from("top_games")
    .select("igdb_id, name, cover_url")
    .order("avg_rating", { ascending: false })
    .order("recent_reviews", { ascending: false })
    .limit(10)
    .returns<Game[]>();

  let followingReviews = null;

  if (user) {
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    if (following && following.length > 0) {
      const followingIds = following.map((f) => f.following_id);

      const { data: reviews } = await supabase
        .from("reviews")
        .select(`
          id,
          review_text,
          rating,
          created_at,
          game_id,
          likes,
          user_id,
          games!reviews_game_id_fkey (name, cover_url),
          profiles!reviews_user_id_profiles_fkey (username, avatar_url)
        `)
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })
        .limit(6);

      followingReviews = reviews;
    }
  }

  const { data: topReviews } = await supabase
    .from("top_recent_reviews")
    .select(
      "review_id, review_text, rating, created_at, game_id, likes, game_name, cover_url, username"
    )
    .order("likes", { ascending: false })
    .limit(3);

  if (!games || games.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">No games found.</div>
    );
  }

  const reviewsToShow = followingReviews && followingReviews.length > 0 
    ? followingReviews 
    : topReviews;
  
  const reviewsTitle = followingReviews && followingReviews.length > 0
    ? "Recent reviews from people you follow"
    : "Our best reviews";

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <UserGreeting />
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Our most popular titles
        </h2>
      </div>
      <GameCarousel games={games} />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {reviewsTitle}
        </h2>
        {followingReviews && followingReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followingReviews.map((review: any) => (
              <div
                key={review.id}
                className="flex flex-col bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-lg border border-gray-700/50 shadow-lg hover:border-teal-500/50 transition-all"
              >
                <Link
                  href={`/profile/${review.profiles?.username}`}
                  className="flex items-center gap-3 mb-4 hover:opacity-80 transition"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {review.profiles?.avatar_url ? (
                      <Image
                        src={review.profiles.avatar_url}
                        alt={review.profiles.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {review.profiles?.username || "Anonymous"}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>

                <div className="flex gap-4">
                  <div className="w-20 flex-shrink-0">
                    <Link
                      href={`/game/${review.game_id}`}
                      className="block hover:opacity-90 transition"
                    >
                      <GameCover
                        coverUrl={review.games?.cover_url}
                        name={review.games?.name}
                      />
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/game/${review.game_id}`}
                      className="font-semibold text-white hover:text-teal-400 transition text-sm mb-2 line-clamp-1 block"
                    >
                      {review.games?.name || "Unknown Game"}
                    </Link>
                    <div className="flex text-yellow-400 text-sm mb-2">
                      {"★".repeat(Math.floor(review.rating))}
                      {"☆".repeat(5 - Math.floor(review.rating))}
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {review.review_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topReviews?.map((review) => (
              <div
                key={review.review_id}
                className="flex bg-teal-900 p-6 rounded-lg shadow-md"
              >
                <div className="w-1/3 mr-4">
                  <Link
                    href={`/game/${review.game_id}`}
                    className="block hover:opacity-90 transition"
                  >
                    <GameCover
                      coverUrl={review.cover_url}
                      name={review.game_name}
                    />
                  </Link>
                </div>
                <div className="w-2/3">
                  <h4 className="font-bold text-white mb-2">
                    {review.username || "Anonymous"}
                  </h4>
                  <div className="flex text-yellow-400 mb-2">
                    {"★".repeat(Math.floor(review.rating))}
                    {"☆".repeat(5 - Math.floor(review.rating))}
                  </div>
                  <p className="text-gray-300 italic">{review.review_text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (!followingReviews || followingReviews.length === 0) && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-2">
              You're not following anyone yet!
            </p>
            <p className="text-gray-500 text-sm">
              Follow other users to see their latest reviews here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}