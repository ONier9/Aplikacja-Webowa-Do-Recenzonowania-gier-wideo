import Link from "next/link";
import { GameCover } from "@/components/page-elements/game-cover";

export interface SimpleGame {
  igdb_id: number;
  name: string;
  cover_url: string | null;
}

interface GameGridProps {
  games: SimpleGame[];
}

export default function GameGrid({ games }: GameGridProps) {
  const hasUniqueIds =
    new Set(games.map((game) => game.igdb_id)).size === games.length;

  if (!hasUniqueIds) {
    console.warn("Warning: Duplicate game IDs detected in GameGrid");
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 gap-6">
      {games.map((game) => {
        const uniqueKey = `${game.igdb_id}_${game.name}`;

        return (
          <Link key={uniqueKey} href={`/game/${game.igdb_id}`} passHref>
            <div className="max-w-[180px] mx-auto">
              <GameCover coverUrl={game.cover_url} name={game.name} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
