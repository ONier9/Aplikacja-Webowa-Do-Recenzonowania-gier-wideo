export interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  game_id: number;
  likes: number;
  updated: boolean;
}

export interface ReviewWithUser extends Review {
  game_cover_url: string | null; 
  game_name: string; 
  username: string;
  avatar_url: string | null; 
  likedByUser: boolean;
}

export interface ReviewStats {
  averageScore: string | null;
  totalReviews: number;
}