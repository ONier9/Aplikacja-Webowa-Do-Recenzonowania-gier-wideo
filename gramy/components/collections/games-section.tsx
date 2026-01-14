import { Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GameGrid from '@/components/page-elements/game-grid';

interface GamesSectionProps {
  games: Array<{
    igdb_id: number;
    name: string;
    cover_url: string | null;
    added_at: string;
  }>;
  isOwner: boolean;
  isSystemCollection: boolean;
  onRemove?: (gameId: number) => void;
}

export function GamesSection({ games, isOwner, isSystemCollection, onRemove }: GamesSectionProps) {
  const router = useRouter();

  if (games.length === 0) {
    return (
      <EmptyGamesSection 
        isOwner={isOwner} 
        isSystemCollection={isSystemCollection} 
        onBrowseGames={() => router.push('/')} 
      />
    );
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Games in Collection</h2>
        <p className="text-gray-400">
          {getDescriptionText(isOwner, isSystemCollection)}
        </p>
      </div>
      
      <GameGrid 
        games={games}
        onRemove={isOwner && !isSystemCollection ? onRemove : undefined}
      />
    </div>
  );
}

function EmptyGamesSection({ 
  isOwner, 
  isSystemCollection, 
  onBrowseGames 
}: { 
  isOwner: boolean; 
  isSystemCollection: boolean; 
  onBrowseGames: () => void;
}) {
  const description = isOwner && !isSystemCollection
    ? "Add games to this collection from individual game pages"
    : isSystemCollection
    ? "Add games by setting their status on game pages"
    : "This collection is empty";

  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
      <Folder className="h-16 w-16 mx-auto mb-4 opacity-30 text-gray-400" />
      <h3 className="text-xl font-semibold text-white mb-2">No games yet</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {isOwner && (
        <button
          onClick={onBrowseGames}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          Browse Games
        </button>
      )}
    </div>
  );
}

function getDescriptionText(isOwner: boolean, isSystemCollection: boolean): string {
  if (isOwner && !isSystemCollection) {
    return "Click on a game to view details, or remove it from this collection.";
  }
  if (isSystemCollection) {
    return "Games are automatically added/removed based on your game status.";
  }
  return "Browse the games in this collection.";
}