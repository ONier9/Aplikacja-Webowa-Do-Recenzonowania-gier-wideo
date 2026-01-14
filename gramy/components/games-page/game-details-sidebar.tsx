'use client';

import GameSidebar from "@/components/games-page/game-sidebar";
import { LinkedGenre, LinkedPlatform, LinkedCompany } from "@/types";

interface Props {
  coverUrl: string;
  name: string;
  genres: LinkedGenre[];
  platforms: LinkedPlatform[];
  companies: LinkedCompany[];
}

export default function GameDetailsSidebar(props: Props) {
  return <GameSidebar {...props} />;
}
