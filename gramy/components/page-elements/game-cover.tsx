"use client";

import Image from "next/image";

interface GameCoverProps {
  coverUrl: string | null;
  name: string;
}

export function GameCover({ coverUrl, name }: GameCoverProps) {
  return (
    <div className="relative w-full aspect-[3/4]">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={name || "Game cover"}
          fill
          className="object-cover rounded-lg shadow-lg"
          sizes="(max-width: 180px) 180px, 180px"
          priority
        />
      ) : (
        <div className="w-full h-full bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
          <h2 className="text-white text-xl font-bold p-4 text-center">
            {name || "Untitled Game"}
          </h2>
        </div>
      )}
    </div>
  );
}
