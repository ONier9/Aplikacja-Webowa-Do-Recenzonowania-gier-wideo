import Link from "next/link";
import Image from "next/image";

interface GameCoverImageProps {
  gameId: string;
  coverUrl?: string | null;
  gameName: string;
}

export function GameCoverImage({ gameId, coverUrl, gameName }: GameCoverImageProps) {
  return (
    <Link
      href={`/game/${gameId}`}
      className="flex-shrink-0 group"
    >
      {coverUrl ? (
        <div className="relative w-24 h-32">
          <Image
            src={coverUrl}
            alt={gameName}
            fill
            className="object-cover rounded-lg group-hover:scale-105 transition-transform"
            sizes="96px"
          />
        </div>
      ) : (
        <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-xs">No Cover</span>
        </div>
      )}
    </Link>
  );
}