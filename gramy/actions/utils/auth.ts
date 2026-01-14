'use server';

import { createClient } from '@/utils/supabase/server';
import { serverAuthService } from '@/services/auth/serverAuthService';

export type AuthResult = {
  user: any | null;
  supabase: any;
  isAuthenticated: boolean;
};

export async function getAuthSession(): Promise<AuthResult> {
  const supabase = await createClient();
  const user = await serverAuthService.getCurrentUser();
  
  return {
    user,
    supabase,
    isAuthenticated: !!user
  };
}

export async function requireUser(errorMessage = 'Unauthorized') {
  const { user, supabase } = await getAuthSession();
  if (!user) throw new Error(errorMessage);
  return { user, supabase };
}

export async function requireOptionalUser() {
  const { user, supabase } = await getAuthSession();
  return { user, supabase };
}

export async function requireAdmin() {
  const { user, supabase } = await getAuthSession();
  if (!user) throw new Error('Not Authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin Access Required');
  }
  
  return { supabase, user };
}

export async function checkCollectionPermission(
  collectionId: string,
  operation: 'view' | 'edit' | 'delete'
) {
  const { user, supabase } = await getAuthSession();
  
  const { data: collection } = await supabase
    .from('collections')
    .select('user_id, is_public, is_system')
    .eq('id', collectionId)
    .single();

  if (!collection) throw new Error('Collection not found');

  const isOwner = user?.id === collection.user_id;
  
  switch (operation) {
    case 'view':
      if (!collection.is_public && !isOwner) {
        throw new Error('Access denied');
      }
      break;
    case 'edit':
    case 'delete':
      if (!isOwner) throw new Error('Ownership required');
      if (collection.is_system) throw new Error('System collections cannot be modified');
      break;
  }

  return { collection, isOwner, user, supabase };
}