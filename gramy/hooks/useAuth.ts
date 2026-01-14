'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

let lastActivityTime = Date.now();
const INACTIVITY_THRESHOLD = 30 * 60 * 1000; 

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
        console.log('[useAuth] Inactive for too long, refreshing page...');
        window.location.reload();
        return true;
      }
      return false;
    };

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('[useAuth] Profile error:', profileError);
          return;
        }
        
        if (mounted && profile) {
          setUsername(profile.username);
        }
      } catch (error) {
        console.error('[useAuth] Profile fetch error:', error);
      }
    };

    const init = async () => {
      if (checkInactivity()) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        } else {
          setUsername(null);
        }
      } catch (error) {
        console.error('[useAuth] Init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setUsername(null);
      }
    });

    const inactivityCheckInterval = setInterval(() => {
      checkInactivity();
    }, 5 * 60 * 1000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(inactivityCheckInterval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUsername(null);
    } catch (error) {
      console.error('[useAuth] Sign out error:', error);
    }
  };

  return { user, username, loading, signOut, error };
};