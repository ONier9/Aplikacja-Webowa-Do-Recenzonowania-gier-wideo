import { notFound } from "next/navigation";
import { getGameDetails } from "@/services";
import { reviewService } from "@/services/reviews"; 
import { createClient } from "@/utils/supabase/server";
import { getUserCollectionsForGame } from "@/actions/collections/";
import { getGameStatus } from "@/actions/games/status";
import GameDetailsClient from "./_GameDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; 
}

export default async function GamePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  if (!id || isNaN(Number(id))) {
    return notFound();
  }
  
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
  const pageSize = 3;
  const sortBy = (resolvedSearchParams.sortBy as "created_at" | "likes") || "created_at";

  const gameDetails = await getGameDetails(id);
  if (!gameDetails?.game) return notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialGameStatus = null;
  let initialCollections: any[] = [];
  let initialGameInCollections: string[] = [];
  let userReview = null;

  if (user) {
    try {
      const [statusResult, collectionsResult, review] = await Promise.all([
        getGameStatus(gameDetails.game.igdb_id),
        getUserCollectionsForGame(gameDetails.game.igdb_id),
        reviewService.getUserReview(gameDetails.game.igdb_id, user.id),
      ]);
      initialGameStatus = statusResult.success && statusResult.data 
        ? statusResult.data.status 
        : null;
      
      if (collectionsResult.success && collectionsResult.data) {
        initialCollections = collectionsResult.data.collections || [];
        initialGameInCollections = collectionsResult.data.collectionIds || [];
      }
      
      userReview = review;
    } catch (error) {
      console.error("[GamePage] Error fetching user data:", error);
    }
  }

  const [{ reviews, totalCount }, averageScore] = await Promise.all([
    reviewService.getGameReviews(
      gameDetails.game.igdb_id,
      page,
      pageSize,
      sortBy,
      user?.id
    ),
    reviewService.getAverageScore(gameDetails.game.igdb_id),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <GameDetailsClient
      game={gameDetails.game}
      genres={gameDetails.genres}
      platforms={gameDetails.platforms}
      companies={gameDetails.companies}
      initialReviews={reviews}
      totalReviews={totalCount}
      currentPage={page}
      totalPages={totalPages}
      initialGameStatus={initialGameStatus}
      initialCollections={initialCollections}
      initialGameInCollections={initialGameInCollections}
      userReview={userReview}
      averageScore={averageScore}
    />
  );
}