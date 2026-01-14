"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Folder, BookOpen, MessageSquare, ListChecks } from "lucide-react";
import UserProfileHeader from "@/components/user-profile/user-profile-header";
import FollowersList from "@/components/user-profile/followers-list";
import UserProfileTabContent from "@/components/user-profile/user-profile-tab-content";
import { useAuth } from "@/hooks/useAuth";
import { ReviewWithUser } from "@/types/";
import { Follower, FollowStats } from "@/actions/followActions"; 
import type { CollectionWithStats } from "@/types/collections";
import type { GameLogWithDetails } from "@/actions/user/stats";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  description: string | null;
  updated_at: string;
}

interface SimpleGame {
  igdb_id: number;
  name: string;
  cover_url: string | null;
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

interface UserProfileClientProps {
  userProfile: UserProfile;
  recentReviews: ReviewWithUser[];
  totalReviewsCount: number;
  favoriteGames: SimpleGame[];
  followers: Follower[];
  followStats: FollowStats;
  averageRating: string;
  ratingDistribution: RatingDistribution;
  allFavoriteGames?: SimpleGame[];
  collections: CollectionWithStats[];
  systemCollections: CollectionWithStats[];
  gameLogs: GameLogWithDetails[];
  userStats: {
    totalCollections: number;
    totalPlayCount: number;
    totalHours: number;
    completedGames: number;
    statusCounts: Record<string, number>;
  };
  initialIsFollowing: boolean;
}

const tabDefinitions = {
  'favorites': { label: 'Favorite Games', icon: TrendingUp },
  'collections': { label: 'Collections', icon: Folder },
  'system-collections': { label: 'Status Lists', icon: ListChecks },
  'logs': { label: 'Gaming Activity', icon: BookOpen },
  'reviews': { label: 'Reviews', icon: MessageSquare }
};

type TabType = keyof typeof tabDefinitions;

export default function UserProfileClient({
  userProfile,
  recentReviews,
  totalReviewsCount,
  favoriteGames,
  followers,
  followStats,
  allFavoriteGames = [],
  averageRating,
  ratingDistribution,
  collections,
  systemCollections,
  gameLogs,
  userStats,
  initialIsFollowing,
}: UserProfileClientProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userProfile.id;
  const [activeTab, setActiveTab] = useState<TabType>('favorites');

  const tabs = Object.entries(tabDefinitions).map(([id, def]) => {
    let count: number | undefined;
    switch(id as TabType) {
      case 'collections':
        count = collections.length;
        break;
      case 'system-collections':
        count = systemCollections.length;
        break;
      case 'logs':
        count = gameLogs.length;
        break;
      case 'reviews':
        count = totalReviewsCount;
        break;
      default:
        count = undefined;
    }

    return {
      id: id as TabType,
      label: def.label,
      icon: def.icon,
      count: count,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <UserProfileHeader
        userProfile={userProfile}
        totalReviewsCount={totalReviewsCount}
        averageRating={averageRating}
        ratingDistribution={ratingDistribution}
        followStats={followStats}
        initialIsFollowing={initialIsFollowing}
      />

      <div className="mt-12 border-b border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <UserProfileTabContent
          activeTab={activeTab}
          isOwnProfile={isOwnProfile}
          userId={userProfile.id}
          userUsername={userProfile.username}
          favoriteGames={favoriteGames}
          allFavoriteGames={allFavoriteGames}
          collections={collections}
          systemCollections={systemCollections}
          gameLogs={gameLogs}
          recentReviews={recentReviews}
          totalReviewsCount={totalReviewsCount}
          userStats={userStats}
        />
      </div>

      <div className="mt-12">
        <FollowersList
          followers={followers}
          username={userProfile.username}
          followerCount={followStats.followers}
          followingCount={followStats.following}
        />
      </div>
    </div>
  );
}