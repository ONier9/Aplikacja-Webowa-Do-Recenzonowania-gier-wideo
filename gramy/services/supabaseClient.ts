import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

export type SupabaseClient = typeof supabase;