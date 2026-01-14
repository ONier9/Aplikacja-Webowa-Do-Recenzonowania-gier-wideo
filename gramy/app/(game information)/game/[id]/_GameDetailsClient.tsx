"use client";

import { useState } from "react";
import BackgroundImage from "@/components/games-page/background-image";
import GameSidebar from "@/components/games-page/game-sidebar";
import GameContent from "@/components/games-page/game-content";
import ReviewsSection from "@/components/games-page/reviews-section";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/context/ModalContext";
import { Game, LinkedGenre, LinkedPlatform, LinkedCompany } from "@/types/";
import { ReviewWithUser } from "@/types/";
import type { CollectionWithStats } from "@/types/collections";
import type { GameStatus } from "@/types/games";

interface GameDetailsClientProps {
  game: Game;
  genres?: LinkedGenre[];
  platforms?: LinkedPlatform[];
  companies?: LinkedCompany[];
  initialReviews?: ReviewWithUser[];
  totalReviews?: number;
  currentPage?: number;
  totalPages?: number;
  initialGameStatus?: GameStatus | null;
  initialCollections?: CollectionWithStats[];
  initialGameInCollections?: string[];
  userReview?: ReviewWithUser | null;
  averageScore?: number | null;
}

export default function GameDetailsClient({
  game,
  genres = [],
  platforms = [],
  companies = [],
  initialReviews = [],
  totalReviews = 0,
  currentPage = 1,
  totalPages = 1,
  initialGameStatus = null,
  initialCollections = [],
  initialGameInCollections = [],
  userReview = null,
  averageScore = null,
}: GameDetailsClientProps) {
  const { user, loading } = useAuth();
  const { openLogin } = useModal();
  const [currentAvgScore, setCurrentAvgScore] = useState(averageScore);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <BackgroundImage imageUrl={game.background_art_url ?? ""} />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <GameSidebar
            coverUrl={game.cover_url ?? ""}
            name={game.name ?? "Unknown Game"}
            genres={genres}
            platforms={platforms}
            companies={companies}
          />

          <div className="flex-1">
            <GameContent
              game={game}
              genres={genres}
              platforms={platforms}
              companies={companies}
              averageScore={currentAvgScore}
              initialGameStatus={initialGameStatus}
              initialCollections={initialCollections}
              initialGameInCollections={initialGameInCollections}
              currentUser={user}
            />

            <ReviewsSection
              gameId={game.igdb_id}
              initialReviews={initialReviews ?? []}
              totalReviews={totalReviews ?? 0}
              totalPages={totalPages ?? 1}
              initialUserReview={userReview ?? null}
              initialAverageScore={averageScore ?? null}
              currentUser={user}
              isAuthReady={!loading}
              onLoginRequired={openLogin}
              onAverageScoreChange={setCurrentAvgScore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
