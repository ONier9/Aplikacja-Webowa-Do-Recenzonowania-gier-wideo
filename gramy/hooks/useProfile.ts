'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ProfileData {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  description: string | null;
}

export function useProfile(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: null,
    username: null,
    avatar_url: null,
    description: null,
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setProfile({
          full_name: null,
          username: null,
          avatar_url: null,
          description: null,
        });
        return;
      }

      const { data, error, status } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, description')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name,
          username: data.username,
          avatar_url: data.avatar_url,
          description: data.description,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    profile,
    setProfile,
    fetchProfile,
  };
}