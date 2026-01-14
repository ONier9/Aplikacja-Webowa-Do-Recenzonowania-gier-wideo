"use client";

import { useState } from "react";
import { Follower, FollowStats } from "@/actions/followActions";
import { ProfileHeader } from "@/components/followers/profile-header";
import { TabNavigation } from "@/components/followers/tab-navigation";
import { UserCard } from "@/components/followers/user-card";
import { EmptyState } from "@/components/followers/empty-state";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FollowersPageClientProps {
  userProfile: UserProfile;
  followers: Follower[];
  following: Follower[];
  followStats: FollowStats;
}

type Tab = "followers" | "following";

export default function FollowersPageClient({
  userProfile,
  followers,
  following,
  followStats,
}: FollowersPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("followers");

  const displayList = activeTab === "followers" ? followers : following;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfileHeader userProfile={userProfile} followStats={followStats} />
      
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        followStats={followStats}
      />

      {displayList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              variant={activeTab}
            />
          ))}
        </div>
      ) : (
        <EmptyState variant={activeTab} username={userProfile.username} />
      )}
    </div>
  );
}