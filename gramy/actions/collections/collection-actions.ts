'use server';

import { requireAuth } from '@/actions/utils/auth/context';
import type { ActionResult } from '@/types/common';

import {
  revalidateCollectionPath,
  revalidateGamePath
} from '@/actions/utils/revalidation/paths';

export async function toggleGameInCollection(
  collectionId: string,
  gameId: number
): Promise<ActionResult<{ isInCollection: boolean }>> {
  try {
    const { user, supabase } = await requireAuth();

    const { data, error } = await supabase.rpc('toggle_collection_game', {
      p_collection_id: collectionId,
      p_game_id: gameId
    });

    if (error) throw error;

    await revalidateCollectionPath(collectionId);
    await revalidateGamePath(gameId.toString());

    return {
      success: true,
      data: { isInCollection: data }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle game'
    };
  }
}

export async function getUserCollectionsForGame(
  gameId: number
): Promise<ActionResult<{
  collections: Array<{ id: string; name: string; game_count: number }>;
  collectionIds: string[];
}>> {
  try {
    const { user, supabase } = await requireAuth();

    const { data: collections } = await supabase
      .from('collections')
      .select('id, name, collection_games(count)')
      .eq('user_id', user.id)
      .eq('is_system', false)
      .order('created_at', { ascending: false });

    if (!collections?.length) {
      return {
        success: true,
        data: { collections: [], collectionIds: [] }
      };
    }

    const { data: collectionGames } = await supabase
      .from('collection_games')
      .select('collection_id')
      .eq('game_id', gameId)
      .in('collection_id', collections.map(c => c.id));

    const collectionsWithCount = collections.map(c => ({
      id: c.id,
      name: c.name,
      game_count: c.collection_games?.[0]?.count || 0
    }));

    return {
      success: true,
      data: {
        collections: collectionsWithCount,
        collectionIds: (collectionGames || []).map(cg => cg.collection_id)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch collections'
    };
  }
}
