'use server';

import { createClient } from '@/utils/supabase/server';
import { serverAuthService } from '@/services/auth/serverAuthService';
import type { User } from '@supabase/supabase-js';

export type AuthContext = {
  user: User;
  supabase: any;
  userId: string;
};

export async function getAuthContext(): Promise<{ user: User | null; supabase: any }> {
  const supabase = await createClient();
  const user = await serverAuthService.getCurrentUser();
  return { user, supabase };
}

export async function requireAuth(errorMessage = 'Authentication required'): Promise<AuthContext> {
  const { user, supabase } = await getAuthContext();
  if (!user) throw new Error(errorMessage);
  return { user, supabase, userId: user.id };
}

export async function requireAdmin(): Promise<AuthContext> {
  const { user, supabase } = await requireAuth();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return { user, supabase, userId: user.id };
}