export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithStats extends Collection {
  game_count: number;
}

export interface CollectionGame {
  igdb_id: number;
  name: string;
  cover_url: string | null;
  added_at: string;
}

export interface CollectionInput {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
}