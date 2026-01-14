import { Follower } from "@/actions/followActions";
import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";

interface UserCardProps {
  user: Follower;
  variant: "followers" | "following";
}

export function UserCard({ user, variant }: UserCardProps) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-purple-800/20 flex items-center justify-center border-2 border-purple-700/30 group-hover:border-purple-500/50 transition-colors flex-shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <UserCircle className="h-10 w-10 text-purple-400/50" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
            {user.username}
          </h3>
          {user.full_name && (
            <p className="text-sm text-gray-400 truncate">
              {user.full_name}
            </p>
          )}
          {user.mutualFollowers !== undefined && user.mutualFollowers > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {user.mutualFollowers} mutual{" "}
              {user.mutualFollowers === 1 ? "follower" : "followers"}
            </p>
          )}
          {user.followed_at && (
            <p className="text-xs text-gray-500 mt-1">
              {variant === "followers" ? "Following since" : "Followed"}{" "}
              {new Date(user.followed_at).toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}