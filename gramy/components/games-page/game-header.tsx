import ExpandableText from "../page-elements/expandable-text";
import GameLogButton from "../game-actions/game-log-button";
import CollectionsManager from "../game-actions/collections-manager";
import GameStatusTracker from "../game-actions/game-status-tracker";
import { CollectionWithGames, GameStatus } from "@/services/collectionsService";

interface GameHeaderProps {
  title: string;
  gameId: number;
  releaseDate?: Date | null;
  averageScore: string | null;
  summary?: string | null;
  initialStatus?: GameStatus | null;
  collections?: CollectionWithGames[];
  gameInCollections?: string[];
}

export default function GameHeader({
  title,
  gameId,
  releaseDate,
  averageScore,
  summary,
  initialStatus = null,
  collections = [],
  gameInCollections = []
}: GameHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-4">
            {title}
            {averageScore && (
              <span className="text-yellow-400 text-2xl font-semibold">
                {averageScore}/5
              </span>
            )}
          </h1>
          {releaseDate && (
            <p className="text-gray-300 mb-2">
              Released: {new Date(releaseDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-start">
          <GameStatusTracker 
            gameId={gameId}
            initialStatus={initialStatus}
          />
          <GameLogButton 
            gameId={gameId}
            gameName={title}
          />
          <CollectionsManager 
            gameId={gameId}
            gameName={title}
            initialCollections={collections}
            initialGameInCollections={gameInCollections}
          />
        </div>
      </div>

      {summary && <ExpandableText text={summary} />}
    </>
  );
}