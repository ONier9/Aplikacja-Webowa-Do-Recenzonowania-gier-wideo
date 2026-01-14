import { notFound } from "next/navigation";
import { userService } from "@/services/userService";
import { getFollowers, getFollowStats, isFollowing } from "@/actions/followActions";
import { getUserCollections } from "@/actions/collections";
import { getUserStats, getUserGameLogsWithDetails } from "@/actions/user/stats";
import UserProfileClient from "./_UserProfileClient";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  
  const userProfile = await userService.getUserProfileByUsername(username);
  if (!userProfile) return notFound();
  
  const initialIsFollowing = await isFollowing(userProfile.id);
  
  const collectionsResult = await getUserCollections(userProfile.id, { includeSystem: true });
  const allCollections = collectionsResult.success ? collectionsResult.data || [] : [];
  const regularCollections = allCollections.filter(c => !c.is_system);
  const systemCollections = allCollections.filter(c => c.is_system);
  
  const [userStatsResult, gameLogsResult] = await Promise.all([
    getUserStats(userProfile.id),
    getUserGameLogsWithDetails(userProfile.id, 50)
  ]);

  const userStats = userStatsResult.success ? userStatsResult.data : {
    totalCollections: 0,
    totalPlayCount: 0,
    totalHours: 0,
    completedGames: 0,
    statusCounts: {}
  };

  const gameLogs = gameLogsResult.success ? gameLogsResult.data || [] : [];
  
  const [
    recentReviews, 
    totalReviewsCount, 
    topFavoriteGames, 
    allFavoriteGames, 
    ratingData,
    recentFollowers,
    followStats
  ] = await Promise.all([
    userService.getUserRecentReviews(userProfile.id, 5),
    userService.getUserReviewsCount(userProfile.id),
    userService.getUserTopFavoriteGames(userProfile.id, 5),
    userService.getUserAllFavorites(userProfile.id), 
    userService.getUserRatingDistribution(userProfile.id),
    getFollowers(userProfile.id, 5),
    getFollowStats(userProfile.id) 
  ]);
  
  return (
    <UserProfileClient
      userProfile={userProfile}
      recentReviews={recentReviews}
      totalReviewsCount={totalReviewsCount}
      favoriteGames={topFavoriteGames}
      allFavoriteGames={allFavoriteGames} 
      followers={recentFollowers}
      followStats={followStats}
      ratingDistribution={ratingData.distribution}
      averageRating={ratingData.averageRating}
      collections={regularCollections}
      systemCollections={systemCollections}
      gameLogs={gameLogs}
      userStats={userStats!}
      initialIsFollowing={initialIsFollowing}
    />
  );
}