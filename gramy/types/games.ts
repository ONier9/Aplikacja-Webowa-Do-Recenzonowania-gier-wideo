export type GameStatus = 
  | 'want_to_play' 
  | 'playing' 
  | 'completed' 
  | 'dropped' 
  | 'on_hold';

export interface GameLog {
  id: string;
  user_id: string;
  game_id: number;
  play_count: number;
  hours_played: number | null;
  platform_id: number | null;
  notes: string | null;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
  review_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameLogInput {
  play_count?: number;
  hours_played?: number | null;
  platform_id?: number | null;
  notes?: string | null;
  completed?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  review_id?: string | null;
}

export interface GameLogUpdate {
  play_count?: number;
  hours_played?: number | null;
  platform_id?: number | null;
  notes?: string | null;
  completed?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
}