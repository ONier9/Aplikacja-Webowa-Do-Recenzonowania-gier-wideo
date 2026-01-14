import { supabase } from "../supabaseClient";

export const authService = {
  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  },
};
