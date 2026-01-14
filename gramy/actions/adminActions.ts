'use server';

import { verifyAdmin } from './utils';
import { revalidateAdmin } from './utils/revalidation';
import type { AdminUser } from './types';

export async function getAdminUsers(query: string = ""): Promise<AdminUser[]> {
  try {
    const { supabase } = await verifyAdmin();

    let dbQuery = supabase
      .from('profiles')
      .select('id, username, email, role, banned, created_at')
      .order('username', { ascending: true })
      .limit(50);

    if (query) {
      dbQuery = dbQuery.ilike('username', `%${query}%`);
    }

    const { data, error } = await dbQuery;
    
    if (error) {
      return [];
    }
    
    return data || [];
  } catch {
    return [];
  }
}

export async function toggleBanStatus(userId: string, currentStatus: boolean) {
  try {
    const { supabase, user } = await verifyAdmin();

    if (user.id === userId) {
      throw new Error("You cannot ban yourself");
    }

    const { error } = await supabase
      .from('profiles')
      .update({ banned: !currentStatus })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update ban status: ${error.message}`);
    }

    revalidateAdmin();
    return { success: true, banned: !currentStatus };
  } catch {
    return { success: false, message: "Failed to update ban status" };
  }
}