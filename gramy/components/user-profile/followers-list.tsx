"use client";

import { Follower } from "@/actions/followActions";
import Link from "next/link";
import Image from "next/image";
import { Users, UserCircle } from "lucide-react";

interface FollowersListProps {
  followers: Follower[];
  username: string;
  followerCount: number;
  followingCount: number;
}

export default function FollowersList({ 
  followers, 
  username, 
  followerCount,
  followingCount 
}: FollowersListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            Recent Followers
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {followerCount} followers · {followingCount} following
          </p>
        </div>
        {followers.length >= 5 && (
          <Link
            href={`/profile/${username}/followers`}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      {followers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {followers.map((follower) => (
            <Link
              key={follower.id}
              href={`/profile/${follower.username}`}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple-900/40 to-purple-800/20 flex items-center justify-center border-2 border-purple-700/30 group-hover:border-purple-500/50 transition-colors">
                {follower.avatar_url ? (
                  <Image
                    src={follower.avatar_url}
                    alt={follower.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-purple-400/50" />
                )}
              </div>

              <div className="text-center">
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                  {follower.username}
                </h3>
                {follower.mutualFollowers !== undefined && follower.mutualFollowers > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {follower.mutualFollowers} mutual
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No followers yet.</p>
        </div>
      )}
    </div>
  );
}