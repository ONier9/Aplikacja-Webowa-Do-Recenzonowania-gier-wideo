import { createClient } from '@/utils/supabase/server';

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

export interface CollectionWithGames extends Collection {
  game_count: number;
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

export interface GameLogWithDetails extends GameLog {
  game_name: string;
  game_cover: string | null;
  platform_name: string | null;
}

export type GameStatus =
  | 'want_to_play'
  | 'playing'
  | 'completed'
  | 'dropped'
  | 'on_hold';

export const collectionsService = {

  async getUserCollections(userId: string): Promise<CollectionWithGames[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_games(count)')
      .eq('user_id', userId)
      .eq('is_system', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(c => ({
      ...c,
      game_count: c.collection_games?.[0]?.count || 0
    }));
  },

  async getCollectionById(
    collectionId: string,
    viewerId?: string
  ): Promise<CollectionWithGames | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_games(count)')
      .eq('id', collectionId)
      .single();

    if (error) return null;

    if (!data.is_public && data.user_id !== viewerId) {
      return null;
    }

    return {
      ...data,
      game_count: data.collection_games?.[0]?.count || 0
    };
  },

  async getCollectionGames(
    collectionId: string,
    viewerId?: string
  ) {
    const collection = await this.getCollectionById(collectionId, viewerId);
    if (!collection) throw new Error('Collection not found');

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('collection_games')
      .select(`
        game_id,
        added_at,
        games!inner (
          igdb_id,
          name,
          cover_url
        )
      `)
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      igdb_id: item.games.igdb_id,
      name: item.games.name,
      cover_url: item.games.cover_url,
      added_at: item.added_at
    }));
  },


  async getUserGameLogs(
    userId: string,
    limit = 20
  ): Promise<GameLogWithDetails[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('game_logs')
      .select(`
        *,
        games!inner (name, cover_url),
        platforms (name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(log => ({
      ...log,
      game_name: log.games.name,
      game_cover: log.games.cover_url,
      platform_name: log.platforms?.name || null
    }));
  },

  async getGameLogs(userId: string, gameId: number): Promise<GameLog[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createGameLog(
    userId: string,
    gameId: number,
    logData: Partial<GameLog>
  ): Promise<GameLog> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('game_logs')
      .insert({
        user_id: userId,
        game_id: gameId,
        play_count: logData.play_count ?? 1,
        hours_played: logData.hours_played ?? null,
        platform_id: logData.platform_id ?? null,
        notes: logData.notes ?? null,
        completed: logData.completed ?? false,
        started_at: logData.started_at ?? null,
        completed_at: logData.completed_at ?? null,
        review_id: logData.review_id ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGameStatus(
    userId: string,
    gameId: number
  ): Promise<GameStatus | null> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('game_status')
      .select('status')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single();

    return data?.status || null;
  }
};
