'use server';

import { createClient } from '@/utils/supabase/server';
import type { Permission } from './types';


export async function checkCollectionPermission(
  collectionId: string,
  operation: 'view' | 'edit' | 'delete',
  currentUserId?: string
): Promise<{ hasAccess: boolean; isOwner: boolean; collection: any }> {
  const supabase = await createClient();
  
  const { data: collection } = await supabase
    .from('collections')
    .select('user_id, is_public, is_system')
    .eq('id', collectionId)
    .single();

  if (!collection) {
    throw new Error('Collection not found');
  }

  const isOwner = currentUserId === collection.user_id;
  
  switch (operation) {
    case 'view':
      return {
        hasAccess: collection.is_public || isOwner,
        isOwner,
        collection
      };
      
    case 'edit':
    case 'delete':
      if (collection.is_system) {
        throw new Error('Cannot modify system collections');
      }
      return {
        hasAccess: isOwner,
        isOwner,
        collection
      };
      
    default:
      return { hasAccess: false, isOwner, collection };
  }
}