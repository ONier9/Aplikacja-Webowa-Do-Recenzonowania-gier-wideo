import { Game } from './domain/game';

export * from './api/common';
export * from './api/suggestions';
export * from './domain/game';
export * from './domain/genre';
export * from './domain/platform';
export * from './domain/company';
export * from './domain/relations';
export * from './inputs/game.input';
export * from './services/services';
export * from './domain/review';
export * from './actions/admin';
export * from './actions/game.log';
export * from './actions/collections';
export * from './actions/game.status';

export type GameSearchResult = Pick<Game, 'igdb_id' | 'name' | 'cover_url'> & {
  total_count?: number;
};
export type FilterOption = {
  igdb_id: number;
  name: string;
  cover_url?: string | null;
};

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  description: string | null;
  updated_at: string;
  created_at: string;
}

export interface UserStats {
  totalCollections: number;
  totalPlayCount: number;
  totalHours: number;
  completedGames: number;
  statusCounts: Record<string, number>;
}

  igdb_id: number;
  name: string;
  cover_url: string | null;
}

export interface Game extends SimpleGame {
  summary?: string | null;
  first_release_date?: number | null;
  rating?: number | null;
  genres?: string[];
  platforms?: string[];
}

export interface FavoriteGame extends SimpleGame {
  favorite_id: string;
  is_top_favorite?: boolean;
}

export type GameStatus = 'want_to_play' | 'playing' | 'completed' | 'dropped' | 'on_hold';

export interface GameStatusData {
  status: GameStatus;
  updated_at: string;
}

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

export interface CollectionWithGames extends Collection {
  game_count: number;
  likes_count?: number;
  has_liked?: boolean;
  games?: SimpleGame[];
}

export interface StatusCollection {
  name: string;
  description: string;
  is_public: boolean;
  is_system: boolean;
}

export interface GameLog {
  id: string;
  user_id: string;
  game_id: number;
  review_id: string | null;
  play_count: number;
  hours_played: number | null;
  platform_id: number | null;
  notes: string | null;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameLogData {
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

export interface GameLogWithDetails extends GameLog {
  game_name: string;
  game_cover: string | null;
  platform_name: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  game_id: number;
  rating: number;
  review_text: string | null;
  likes: number;
  updated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUser extends Review {
  username: string;
  avatar_url: string | null;
  game_name: string;
  game_cover_url: string | null;
  likedByUser?: boolean;
}

export interface ReviewInput {
  rating: number;
  review_text?: string;
}

export interface ReviewUpdate {
  rating?: number;
  review_text?: string;
}

export interface RatingDistribution {
  "0.5": number;
  "1.0": number;
  "1.5": number;
  "2.0": number;
  "2.5": number;
  "3.0": number;
  "3.5": number;
  "4.0": number;
  "4.5": number;
  "5.0": number;
}

export interface Follower {
  id: string;
  username: string;
  avatar_url: string | null;
  followed_at: string;
}

export interface FollowStats {
  followers: number;
  following: number;
}

export interface CollectionLike {
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Platform {
  id: number;
  name: string;
  abbreviation?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}
export interface FormState<T = any> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}


export type SortOption = 'created_at' | 'updated_at' | 'rating' | 'likes' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  status?: GameStatus[];
  platforms?: number[];
  completed?: boolean;
  hasNotes?: boolean;
}

export interface SortOptions {
  sortBy: SortOption;
  direction: SortDirection;
}

export interface TabDefinition {
  id: string;
  label: string;
  icon: any; 
  count?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};


export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationSchema<T> {
  [K: keyof T]: ValidationRule<T[K]>[];
}
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}