import { UserProfile, FollowStats } from "@/actions/followActions";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

interface ProfileHeaderProps {
  userProfile: UserProfile;
  followStats: FollowStats;
}

export function ProfileHeader({ userProfile, followStats }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/profile/${userProfile.username}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl border border-purple-700/30">
          <Users className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {userProfile.username}
          </h1>
          <p className="text-gray-400 mt-1">
            {followStats.followers} followers · {followStats.following} following
          </p>
        </div>
      </div>
    </div>
  );
}