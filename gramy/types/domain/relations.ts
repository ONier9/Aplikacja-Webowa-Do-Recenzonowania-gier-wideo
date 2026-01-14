export type GenreGame = {
  created_at: Date;
  genre_id: number;
  game_id: number;
};

export type PlatformGame = {
  created_at: Date;
  platform_id: number;
  game_id: number;
};

export type CompanyGame = {
  created_at: Date;
  game_id: number;
  company_id: number;
};