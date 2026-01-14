import { createClient } from '@/utils/supabase/server';

export const serverAuthService = {
  async getCurrentUser() {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  },

  async getSession() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return data.session;
  }
};