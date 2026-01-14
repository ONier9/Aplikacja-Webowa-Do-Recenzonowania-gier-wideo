'use server';

import { createClient } from '@/utils/supabase/server';
import type { ActionResult } from '@/types/common';

export interface UserStats {
  totalCollections: number;
  totalPlayCount: number;
  totalHours: number;
  completedGames: number;
  statusCounts: Record<string, number>;
}

export interface GameLogWithDetails {
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
  game_name: string;
  game_cover: string | null;
  platform_name: string | null;
}

export async function getUserStats(
  userId: string
): Promise<ActionResult<UserStats>> {
  try {
    const supabase = await createClient();
    
    const [collectionsCount, logs, statuses] = await Promise.all([
      supabase
        .from('collections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_system', false),
      supabase
        .from('game_logs')
        .select('play_count, hours_played, completed')
        .eq('user_id', userId),
      supabase
        .from('game_status')
        .select('status')
        .eq('user_id', userId)
    ]);

    const totalPlayCount = logs.data?.reduce((sum, log) => sum + (log.play_count || 0), 0) || 0;
    const totalHours = logs.data?.reduce((sum, log) => sum + (log.hours_played || 0), 0) || 0;
    const completedGames = logs.data?.filter(log => log.completed).length || 0;

    const statusCounts = statuses.data?.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      success: true,
      data: {
        totalCollections: collectionsCount.count || 0,
        totalPlayCount,
        totalHours,
        completedGames,
        statusCounts
      }
    };
  } catch (error) {
    console.error('getUserStats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user stats'
    };
  }
}


export async function getUserGameLogsWithDetails(
  userId: string,
  limit: number = 50
): Promise<ActionResult<GameLogWithDetails[]>> {
  try {
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

    const logs = (data || []).map(log => ({
      ...log,
      game_name: log.games.name,
      game_cover: log.games.cover_url,
      platform_name: log.platforms?.name || null
    }));

    return {
      success: true,
      data: logs
    };
  } catch (error) {
    console.error('getUserGameLogsWithDetails error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get game logs'
    };
  }
}