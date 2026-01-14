"use client";

import GameHeader from "@/components/games-page/game-header";
import ScreenshotSlider from "@/components/games-page/screenshot-slider";
import { Game, LinkedGenre, LinkedPlatform, LinkedCompany } from "@/types/";
import { GameStatus, CollectionWithGames } from "@/services/collectionsService";

interface GameContentProps {
  game: Game;
  genres: LinkedGenre[];
  platforms: LinkedPlatform[];
  companies: LinkedCompany[];
  averageScore: number | null;
  initialGameStatus: GameStatus | null;
  initialCollections: CollectionWithGames[];
  initialGameInCollections: string[];
  currentUser: any;
}

export default function GameContent({
  game,
  averageScore,
  initialGameStatus,
  initialCollections,
  initialGameInCollections,
  currentUser,
}: GameContentProps) {
  return (
    <div className="flex-1 pl-6">
      <GameHeader
        title={game.name || "Untitled Game"}
        gameId={game.igdb_id}
        releaseDate={game.release_date}
        averageScore={averageScore}
        summary={game.summary}
        initialStatus={initialGameStatus}
        collections={initialCollections}
        gameInCollections={initialGameInCollections}
        currentUser={currentUser}
      />

      {game.screenshots?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Screenshots</h2>
          <div className="max-w-[700px] lg:max-w-[900px] mx-auto md:mx-0">
            <ScreenshotSlider screenshots={game.screenshots} gameName={game.name} />
          </div>
        </div>
      )}
    </div>
  );
}