'use server';

import { createClient } from '@/utils/supabase/server';
import { requireAuth } from '@/actions/utils/auth/context';
import { revalidateAllForGame, revalidateProfilePath } from '@/actions/utils/revalidation/paths';
import type { ActionResult } from '@/types/common';
import type { GameStatus } from '@/types/games';


function getStatusMapping(): Record<GameStatus, string> {
  return {
    want_to_play: 'Want to Play',
    playing: 'Currently Playing',
    completed: 'Completed',
    dropped: 'Dropped',
    on_hold: 'On Hold',
  };
}

function isValidStatus(status: string): boolean {
  const validStatuses = ['want_to_play', 'playing', 'completed', 'dropped', 'on_hold'];
  return validStatuses.includes(status);
}


export async function getGameStatus(gameId: number): Promise<ActionResult<{ status: GameStatus | null }>> {
  try {
    const supabase = await createClient();
    const { user } = await requireAuth();

    const { data, error } = await supabase
      .from('game_status')
      .select('status')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    return { 
      success: true, 
      data: { status: data?.status as GameStatus || null } 
    };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to get game status' 
    };
  }
}


export async function setGameStatus(gameId: number, status: string): Promise<ActionResult<{ status: string }>> {
  try {
    if (!status || !isValidStatus(status)) {
      return { success: false, error: 'Invalid game status' };
    }

    const supabase = await createClient();
    const { user } = await requireAuth();

    const { error } = await supabase.rpc('set_game_status', {
      p_user_id: user.id,
      p_game_id: gameId,
      p_status: status as GameStatus
    });

    if (error) return { success: false, error: error.message };

    await revalidateAllForGame(gameId.toString());
    await revalidateProfilePath();

    return { success: true, data: { status } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to set game status' };
  }
}


export async function removeGameStatus(gameId: number): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { user } = await requireAuth();

    const { error } = await supabase.rpc('remove_game_status', {
      p_user_id: user.id,
      p_game_id: gameId
    });

    if (error) return { success: false, error: error.message };

    await revalidateAllForGame(gameId.toString());
    await revalidateProfilePath();

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove game status' };
  }
}

export async function getStatusMappingAsync(): Promise<ActionResult<Record<GameStatus, string>>> {
  try {
    return { 
      success: true, 
      data: getStatusMapping() 
    };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to get status mapping' 
    };
  }
}


export async function initializeStatusCollections(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { user } = await requireAuth();

    const { error } = await supabase.rpc('initialize_status_collections', {
      p_user_id: user.id
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to initialize collections' };
  }
}

export async function cleanupStatusCollections(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const supabase = await createClient();
    const { user } = await requireAuth();

    const { data, error } = await supabase.rpc('cleanup_status_collections', {
      p_user_id: user.id
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || { deleted: 0 } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to cleanup collections' };
  }
}