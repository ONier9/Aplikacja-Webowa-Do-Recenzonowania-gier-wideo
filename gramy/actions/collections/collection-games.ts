'use server';

import { createClient } from '@/utils/supabase/server';
import { serverAuthService } from '@/services/auth/serverAuthService';
import { requireAuth } from '@/actions/utils/auth/context';

import { checkCollectionPermission } from '@/actions/utils/auth/permissions';
import type { Permission } from '@/actions/utils/auth/types';

import {
  revalidateCollectionPath,
  revalidateGamePath
} from '@/actions/utils/revalidation/paths';

import type { ActionResult } from '@/types/common';
import type { CollectionGame } from '@/types/collections';

export async function addGameToCollection(
  collectionId: string,
  gameId: number
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAuth();

    const { hasAccess } = await checkCollectionPermission(collectionId, Permission.EDIT, user.id);
    if (!hasAccess) throw new Error('Access denied');

    const { error } = await supabase.rpc('add_game_to_collection', {
      p_collection_id: collectionId,
      p_game_id: gameId,
      p_user_id: user.id
    });

    if (error) throw error;

    await revalidateCollectionPath(collectionId);
    await revalidateGamePath(gameId.toString());

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add game'
    };
  }
}

export async function removeGameFromCollection(
  collectionId: string,
  gameId: number
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAuth();

    const { hasAccess } = await checkCollectionPermission(collectionId, Permission.EDIT, user.id);
    if (!hasAccess) throw new Error('Access denied');

    const { error } = await supabase.rpc('remove_game_from_collection', {
      p_collection_id: collectionId,
      p_game_id: gameId,
      p_user_id: user.id
    });

    if (error) throw error;

    await revalidateCollectionPath(collectionId);
    await revalidateGamePath(gameId.toString());

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove game'
    };
  }
}

export async function getCollectionGames(
  collectionId: string
): Promise<ActionResult<CollectionGame[]>> {
  try {
    const supabase = await createClient();
    const currentUser = await serverAuthService.getCurrentUser();

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('user_id, is_public, is_system')
      .eq('id', collectionId)
      .single();

    if (collectionError) throw collectionError;

    const isOwner = currentUser?.id === collection.user_id;
    const canView = isOwner || collection.is_public;

    if (!canView) {
      throw new Error('Access denied');
    }

    const { data, error } = await supabase
      .from('collection_games')
      .select(`
        game_id,
        added_at,
        games (
          igdb_id,
          name,
          cover_url
        )
      `)
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });

    if (error) throw error;

    const games = (data || [])
      .filter(item => item.games) 
      .map(item => ({
        igdb_id: (item.games as any).igdb_id,
        name: (item.games as any).name,
        cover_url: (item.games as any).cover_url,
        added_at: item.added_at
      }));

    return {
      success: true,
      data: games
    };
  } catch (error) {
    console.error('Error in getCollectionGames:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get collection games'
    };
  }
}

export async function isGameInCollection(
  collectionId: string,
  gameId: number
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const currentUser = await serverAuthService.getCurrentUser();

    const { hasAccess } = await checkCollectionPermission(collectionId, Permission.VIEW, currentUser?.id);
    if (!hasAccess) throw new Error('Access denied');

    const { data, error } = await supabase
      .from('collection_games')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('game_id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; 

    return {
      success: true,
      data: !!data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check game'
    };
  }
}