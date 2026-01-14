"use client";

import Image from "next/image";
import Link from "next/link";
import { UserCircle, Calendar, MessageSquare, Star, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FollowStats } from "@/actions/followActions";
import FollowButton from "@/components/user-profile/follow-button";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  description: string | null;
  updated_at: string;
}

interface RatingDistribution {
  [key: string]: number;
  "0.5": number;
  "1.0": number;
  "1.5": number;
  "2.0": number;
  "2.5": number;
  "3.0": number;
  "3.5": number;
  "4.0": number;
  "4.5": number;
  "5.0": number;
}

interface UserProfileHeaderProps {
  userProfile: UserProfile;
  totalReviewsCount: number;
  averageRating: string;
  ratingDistribution: RatingDistribution;
  followStats: FollowStats;
  initialIsFollowing: boolean;
}

export default function UserProfileHeader({
  userProfile,
  totalReviewsCount,
  averageRating,
  ratingDistribution,
  followStats,
  initialIsFollowing,
}: UserProfileHeaderProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userProfile.id;

  const chartData = Object.entries(ratingDistribution)
    .filter(([rating]) => parseFloat(rating) > 0)
    .map(([rating, count]) => ({
      rating: parseFloat(rating).toFixed(1),
      count,
    }))
    .sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalReviewsCount > 0 
        ? (data.count / totalReviewsCount * 100).toFixed(1) 
        : 0;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-1">{label} stars</p>
          <p className="text-sm text-gray-400">
            {data.count} reviews ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 rounded-2xl border border-gray-700/50 shadow-2xl">

      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="absolute top-6 right-6 z-10">
        {isOwnProfile ? (
          <Link
            href="/settings"
            className="p-2.5 bg-gray-800/90 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-all duration-200 border border-gray-700 hover:border-teal-500 shadow-lg hover:shadow-teal-500/20 inline-flex"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        ) : (
          user && (
            <FollowButton
              targetUserId={userProfile.id}
              targetUsername={userProfile.username}
              initialIsFollowing={initialIsFollowing}
            />
          )
        )}
      </div>

      <div className="relative p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-900/60 to-purple-900/60 flex items-center justify-center border-4 border-gray-700/50 shadow-xl">
              {userProfile.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt={userProfile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserCircle className="h-28 w-28 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex-1 pt-2 min-w-0">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              {userProfile.username}
            </h1>
            {userProfile.full_name && (
              <p className="text-lg text-gray-300 mb-4">{userProfile.full_name}</p>
            )}

            {userProfile.description && (
              <p className="text-gray-300 text-base leading-relaxed">
                {userProfile.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-3">
            <Link
              href={`/profile/${userProfile.username}/followers`}
              className="flex items-center gap-3 text-lg hover:text-purple-400 transition-colors group"
            >
              <Users className="h-6 w-6 text-purple-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white group-hover:text-purple-400">{followStats.followers}</span>
                <span className="text-gray-400"> followers</span>
                <span className="text-gray-600 mx-2">•</span>
                <span className="font-bold text-white group-hover:text-purple-400">{followStats.following}</span>
                <span className="text-gray-400"> following</span>
              </div>
            </Link>

            <Link
              href={`/profile/${userProfile.username}/reviews`}
              className="flex items-center gap-3 text-lg hover:text-blue-400 transition-colors group"
            >
              <MessageSquare className="h-6 w-6 text-blue-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white group-hover:text-blue-400">{totalReviewsCount}</span>
                <span className="text-gray-400"> reviews</span>
              </div>
            </Link>

            <div className="flex items-center gap-3 text-lg">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white">{averageRating}</span>
                <span className="text-gray-400"> average rating</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-lg">
              <Calendar className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <span className="text-gray-400">Joined </span>
                <span className="font-bold text-white">
                  {new Date(userProfile.updated_at).toLocaleDateString("en-US", { 
                    month: "long", 
                    year: "numeric" 
                  })}
                </span>
              </div>
            </div>
          </div>

          {chartData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Rating Distribution
              </h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="rating"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(55, 65, 81, 0.2)" }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      fill="url(#colorGradient)"
                      animationDuration={800}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}