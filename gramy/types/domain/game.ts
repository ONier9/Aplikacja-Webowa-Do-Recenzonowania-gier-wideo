import { LinkedCompany, LinkedGenre, LinkedPlatform } from "@/types";
import { CompanyGame, GenreGame, PlatformGame } from "./relations";
export type Game = {

  igdb_id: number;
  name: string;
  cover_url: string | null;
  summary: string | null;
  release_date: Date | null;
  screenshots: any | null;
  background_art_url: string | null;
  created_at: Date;
};

export type GameWithRelations = Game & {
  genres: GenreGame[];
  platforms: PlatformGame[];
  companies: CompanyGame[];
};

export type GameDetails = {
  game: Game | null;
  genres: LinkedGenre[];
  platforms: LinkedPlatform[];
  companies: LinkedCompany[]; 
};