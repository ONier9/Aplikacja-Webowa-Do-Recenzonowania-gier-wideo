export interface GameLogData {
  play_count?: number;
  hours_played?: number | null;
  platform_id?: number | null;
  notes?: string | null;
  completed?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  rating?: number;
  review_text?: string;
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