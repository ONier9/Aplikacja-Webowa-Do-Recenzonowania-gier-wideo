export type GameStatus =
  | 'want_to_play'
  | 'playing'
  | 'completed'
  | 'dropped'
  | 'on_hold'
  | null;

export interface StatusCollection {
  name: string;
  description: string;
  is_public: boolean;
  is_system: boolean;
}

export interface FormattedCollection {
  id: string;
  name: string;
  description: string;
  user_id: string;
  is_public: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  games: Array<{
    igdb_id: number;
    name: string;
    cover_url: string | null;
  }>;
  game_count: number;
}
