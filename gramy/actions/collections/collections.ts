'use server';

import { createClient } from '@/utils/supabase/server';
import { serverAuthService } from '@/services/auth/serverAuthService';
import { requireAuth } from '@/actions/utils/auth/context';

import {
  revalidateProfilePath,
  revalidateCollectionsListPath,
  revalidateCollectionPath
} from '@/actions/utils/revalidation/paths';

import { CollectionValidator } from '@/actions/utils/validation/collections';
import type { ActionResult } from '@/types/common';
import type { CollectionInput, CollectionUpdate, CollectionWithStats } from '@/types/collections';

export async function createCollection(
  input: CollectionInput
): Promise<ActionResult<CollectionWithStats>> {
  try {
    const { user, supabase } = await requireAuth();

    CollectionValidator.validateCollectionInput(input);

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        is_public: input.isPublic ?? true,
        is_system: false
      })
      .select()
      .single();

    if (error) throw error;

    await revalidateProfilePath(user.id);
    await revalidateCollectionsListPath();

    return {
      success: true,
      data: { ...data, game_count: 0 }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection'
    };
  }
}
export async function addGameToCollection(
  collectionId: string,
  gameId: string
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAuth();

    const { data: collection } = await supabase
      .from('collections')
      .select('user_id')
      .eq('id', collectionId)
      .single();

    if (!collection || collection.user_id !== user.id) {
      throw new Error('Collection not found or access denied');
    }

    const { error } = await supabase
      .from('collection_games')
      .insert({
        collection_id: collectionId,
        game_id: gameId
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Game already in collection');
      }
      throw error;
    }

    await revalidateCollectionPath(collectionId);
    await revalidateProfilePath(user.id);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add game'
    };
  }
}
export async function getUserCollections(
  targetUserId?: string,
  options: { includeSystem?: boolean } = {}
): Promise<ActionResult<CollectionWithStats[]>> {
  try {
    const supabase = await createClient();
    const currentUser = await serverAuthService.getCurrentUser();

    const userId = targetUserId ?? currentUser?.id;
    if (!userId) throw new Error('Authentication required');

    const isOwnProfile = currentUser?.id === userId;

    let query = supabase
      .from('collections')
      .select('*, collection_games(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!isOwnProfile) query = query.eq('is_public', true);
    if (!options.includeSystem) query = query.eq('is_system', false);

    const { data, error } = await query;
    if (error) throw error;

    const collections = (data || []).map(collection => ({
      ...collection,
      game_count: collection.collection_games?.[0]?.count || 0
    }));

    return { success: true, data: collections };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get collections'
    };
  }
}

export async function getCollectionById(
  collectionId: string
): Promise<ActionResult<CollectionWithStats>> {
  try {
    const supabase = await createClient();
    const currentUser = await serverAuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_games(count)')
      .eq('id', collectionId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Collection not found');

    const isOwner = currentUser?.id === data.user_id;
    if (!data.is_public && !isOwner) throw new Error('Access denied');

    return {
      success: true,
      data: { ...data, game_count: data.collection_games?.[0]?.count || 0 }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get collection'
    };
  }
}

export async function updateCollection(
  collectionId: string,
  updates: CollectionUpdate
): Promise<ActionResult<CollectionWithStats>> {
  try {
    const { user, supabase } = await requireAuth();

    if (updates.name) CollectionValidator.validateName(updates.name);
    if (updates.description) CollectionValidator.validateDescription(updates.description);

    const { data: existing } = await supabase
      .from('collections')
      .select('is_system')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (!existing) throw new Error('Collection not found');
    if (existing.is_system) throw new Error('Cannot modify system collections');

    const { data, error } = await supabase
      .from('collections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select('*, collection_games(count)')
      .single();

    if (error) throw error;

    await revalidateProfilePath(user.id);
    await revalidateCollectionPath(collectionId);

    return {
      success: true,
      data: { ...data, game_count: data.collection_games?.[0]?.count || 0 }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update collection'
    };
  }
}


export async function deleteCollection(
  collectionId: string
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requireAuth();

    const { data: existing } = await supabase
      .from('collections')
      .select('is_system')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (!existing) throw new Error('Collection not found');
    if (existing.is_system) throw new Error('Cannot delete system collections');

    const { error, count } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    if (count === 0) throw new Error('Collection not found or access denied');

    await revalidateProfilePath(user.id);
    await revalidateCollectionsListPath();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete collection'
    };
  }
}
