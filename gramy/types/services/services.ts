export interface RpcGameResult {
  background_art_url: null;
  igdb_id: number;
  name: string;
  summary?: string;
  cover_url?: string;
  release_date?: string;
  screenshots?: any;
  total_count: number;
}

export type EntityType = 'genre' | 'company' | 'platform';

export type LinkedCompany = {
  igdb_id: number;
  name: string;
};

export type LinkedGenre = {
  igdb_id: number;
  name: string;
};

export type LinkedPlatform = {
  igdb_id: number;
  name: string;
};

export interface RpcGameDetailsResult {
  game_background_art_url: string | null;
  game_igdb_id: number;
  game_name: string;
  game_summary: string | null;
  game_cover_url: string | null;
  game_release_date: string | null;
  game_screenshots: any | null;
  game_created_at: string;
  genres: LinkedGenre[];
  platforms: LinkedPlatform[];
  companies: LinkedCompany[];
}