'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/actions/utils/auth/context';
import { revalidateAllForGame, revalidateProfilePath } from '@/actions/utils/revalidation/paths';
import type { ActionResult } from '@/types/common';
import type { GameLog, GameLogInput, GameLogUpdate } from '@/types/games';


function validateLogData(data: GameLogInput | GameLogUpdate): void {
  if (data.hours_played != null) {
    if (data.hours_played < 0) throw new Error('Hours played cannot be negative');
    if (data.hours_played > 9999) throw new Error('Hours played cannot exceed 9999');
  }

  if (data.play_count != null) {
    if (data.play_count < 1) throw new Error('Play count must be at least 1');
    if (data.play_count > 999) throw new Error('Play count cannot exceed 999');
  }
}

export async function createGameLog(
  gameId: number,
  logData: GameLogInput
): Promise<ActionResult<string>> {
  try {
    const { user, supabase } = await requireAuth();
    validateLogData(logData);

    const { data, error } = await supabase
      .from('game_logs')
      .insert({
        user_id: user.id,
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
      .select('id')
      .single();

    if (error) throw error;

    await revalidateAllForGame(gameId.toString());
    await revalidateProfilePath();

    return { success: true, data: data.id };
  } catch (err) {
    console.error('createGameLog error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create game log' };
  }
}

export async function updateGameLog(
  logId: string,
  updates: GameLogUpdate
): Promise<ActionResult<GameLog>> {
  try {
    const { user, supabase } = await requireAuth();
    validateLogData(updates);

    const { data: existing, error: fetchError } = await supabase
      .from('game_logs')
      .select('user_id, game_id')
      .eq('id', logId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Log not found');
    if (existing.user_id !== user.id) throw new Error('Access denied');

    const { data, error } = await supabase
      .from('game_logs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;

    await revalidateAllForGame(existing.game_id.toString());
    await revalidateProfilePath();

    return { success: true, data };
  } catch (err) {
    console.error('updateGameLog error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update game log' };
  }
}


export async function deleteGameLog(logId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAuth();

    const { data: existing, error: fetchError } = await supabase
      .from('game_logs')
      .select('user_id, game_id')
      .eq('id', logId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Log not found');
    if (existing.user_id !== user.id) throw new Error('Access denied');

    const { error } = await supabase.from('game_logs').delete().eq('id', logId);
    if (error) throw error;

    await revalidateAllForGame(existing.game_id.toString());
    await revalidateProfilePath();

    return { success: true };
  } catch (err) {
    console.error('deleteGameLog error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete game log' };
  }
}

export async function getUserGameLogs(gameId?: number, limit = 20): Promise<ActionResult<GameLog[]>> {
  try {
    const { user, supabase } = await requireAuth();
    let query = supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (gameId) query = query.eq('game_id', gameId);

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('getUserGameLogs error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to get game logs' };
  }
}

export async function getGameLogById(logId: string): Promise<ActionResult<GameLog>> {
  try {
    const { user, supabase } = await requireAuth();

    const { data, error } = await supabase
      .from('game_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Log not found');

    return { success: true, data };
  } catch (err) {
    console.error('getGameLogById error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to get game log' };
  }
}

export async function getGameLogStats(gameId?: number): Promise<ActionResult<{
  totalPlayCount: number;
  totalHours: number;
  completedCount: number;
  averageHours: number;
}>> {
  try {
    const { user, supabase } = await requireAuth();

    let query = supabase.from('game_logs').select('play_count, hours_played, completed').eq('user_id', user.id);
    if (gameId) query = query.eq('game_id', gameId);

    const { data, error } = await query;
    if (error) throw error;

    const logs = data || [];
    const totalPlayCount = logs.reduce((sum, log) => sum + (log.play_count ?? 0), 0);
    const totalHours = logs.reduce((sum, log) => sum + (log.hours_played ?? 0), 0);
    const completedCount = logs.filter(log => log.completed).length;
    const logsWithHours = logs.filter(log => log.hours_played && log.hours_played > 0);
    const averageHours = logsWithHours.length ? totalHours / logsWithHours.length : 0;

    return { success: true, data: { totalPlayCount, totalHours, completedCount, averageHours } };
  } catch (err) {
    console.error('getGameLogStats error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to get stats' };
  }
}
