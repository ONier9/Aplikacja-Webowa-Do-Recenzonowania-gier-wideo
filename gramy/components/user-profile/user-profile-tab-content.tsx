
import React from 'react';
import { SimpleGame, ReviewWithUser, CollectionWithGames, GameLogWithDetails } from "@/types/";
import GameGrid from "@/components/page-elements/game-grid";
import UserCollectionsDisplay from "./user-collections-display";
import UserGameLogsDisplay from "./user-game-logs-display";
import RecentReviewsList from "./recent-reviews-list";
import CreateCollectionModal from "@/components/collections/create-collection-modal";
import Link from "next/link";
import { Star, ListChecks, Folder, BookOpen, MessageSquare } from "lucide-react";
import FavoriteGamesManager from "./favorite-games-manager";

interface UserProfileTabContentProps {
  activeTab: 'favorites' | 'collections' | 'system-collections' | 'logs' | 'reviews';
  isOwnProfile: boolean;
  userId: string;
  favoriteGames: SimpleGame[];
  allFavoriteGames: SimpleGame[];
  collections: CollectionWithGames[];
  systemCollections: CollectionWithGames[];
  gameLogs: GameLogWithDetails[];
  recentReviews: ReviewWithUser[];
  totalReviewsCount: number;
  userStats: any; 
  userUsername: string;
}

const StatBox: React.FC<{ label: string, value: string | number, color?: string }> = ({ label, value, color = 'text-white' }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);


export default function UserProfileTabContent({
  activeTab,
  isOwnProfile,
  userId,
  favoriteGames,
  allFavoriteGames,
  collections,
  systemCollections,
  gameLogs,
  recentReviews,
  totalReviewsCount,
  userStats,
  userUsername,
}: UserProfileTabContentProps) {

  const renderFavorites = () => (
    <>
      {isOwnProfile ? (
        <FavoriteGamesManager
          userId={userId}
          initialTopFavorites={favoriteGames}
          initialAllFavorites={allFavoriteGames}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Favorite Games
            </h2>
          </div>
          {favoriteGames.length > 0 ? (
            <GameGrid games={favoriteGames} />
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="text-gray-400">No favorite games yet.</p>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderCollections = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Folder className="h-6 w-6 text-purple-400" />
          Collections
        </h2>
        {isOwnProfile && (
       <CreateCollectionModal onSuccess={() => window.location.reload()} />
        )}
      </div>
      <UserCollectionsDisplay
        collections={collections}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );

  const renderSystemCollections = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-amber-400" />
          Status Lists
        </h2>
        <p className="text-gray-400 mt-2">
          Automatically updated based on your game statuses
        </p>
      </div>
      {systemCollections.length > 0 ? (
        <div className="space-y-4">
          {systemCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Games with "{collection.name.toLowerCase()}" status
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {collection.game_count || 0}
                    </div>
                    <div className="text-xs text-gray-400">
                      game{(collection.game_count || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <Link
                    href={`/collection/${collection.id}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
          <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-400" />
          <p className="text-gray-400">No status lists available yet.</p>
        </div>
      )}
    </div>
  );

  const renderLogs = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-green-400" />
          Gaming Activity
        </h2>
      </div>
      {userStats.totalHours > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatBox label="Total Plays" value={userStats.totalPlayCount} />
          <StatBox label="Hours Played" value={`${userStats.totalHours.toFixed(1)}h`} />
          <StatBox label="Completed" value={userStats.completedGames} color="text-green-400" />

        </div>
      )}
      <UserGameLogsDisplay
        logs={gameLogs}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );

  const renderReviews = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-400" />
          Recent Reviews
        </h2>
        {totalReviewsCount > 5 && (
          <Link
            href={`/profile/${userUsername}/reviews`}
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            View All ({totalReviewsCount}) →
          </Link>
        )}
      </div>
      <div className="space-y-4">
        <RecentReviewsList reviews={recentReviews} />
      </div>
    </div>
  );

  switch (activeTab) {
    case 'favorites':
      return renderFavorites();
    case 'collections':
      return renderCollections();
    case 'system-collections':
      return renderSystemCollections();
    case 'logs':
      return renderLogs();
    case 'reviews':
      return renderReviews();
    default:
      return <div className="text-gray-400">Select a tab.</div>;
  }
}