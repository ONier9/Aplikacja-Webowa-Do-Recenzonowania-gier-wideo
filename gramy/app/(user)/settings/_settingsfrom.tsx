'use client';

import { useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LoadingState } from '@/components/settings/loading-state';
import { LoginPrompt } from '@/components/settings/login-prompt';
import { AccountFormHeader } from '@/components/settings/account-form-header';
import { EmailField } from '@/components/settings/form-field';
import { TextField } from '@/components/settings/form-field';
import { TextAreaField } from '@/components/settings/text-area-field';
import { FormActions } from '@/components/settings/form-actions';

export default function AccountForm() {
  const { user, authLoading, signOut } = useAuth();
  const { loading, profile, setProfile, fetchProfile } = useProfile(user);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async () => {
    try {
      if (!profile.username) {
        alert('Username is required!');
        return;
      }

      const updates = {
        id: user?.id as string,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        description: profile.description,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      alert('Profile updated! Refreshing page...');
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating the data!');
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    
    if (user) {
      try {
        const updates = {
          id: user.id,
          avatar_url: url,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) throw error;

        alert('Avatar updated! Refreshing page...');
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
      } catch (error) {
        console.error('Error saving avatar:', error);
        alert('Error updating avatar!');
      }
    }
  };

  if (authLoading) return <LoadingState />;
  if (!user) return <LoginPrompt />;

  return (
    <form className="bg-gray-900 p-6 rounded text-white space-y-6 max-w-xl mx-auto">
      <AccountFormHeader
        userId={user.id}
        avatarUrl={profile.avatar_url}
        loading={loading}
        onAvatarUpload={handleAvatarUpload}
      />

      <EmailField email={user.email} />

      <TextField
        id="fullname"
        label="Full Name"
        value={profile.full_name || ''}
        onChange={(value) => setProfile({ ...profile, full_name: value })}
      />

      <TextField
        id="username"
        label="Username"
        value={profile.username || ''}
        onChange={(value) => setProfile({ ...profile, username: value })}
        required={true}
      />

      <TextAreaField
        id="description"
        label="Description"
        value={profile.description || ''}
        onChange={(value) => setProfile({ ...profile, description: value })}
        placeholder="Tell us about yourself..."
        maxLength={500}
      />

      <FormActions
        loading={loading}
        disabled={!profile.username}
        onSave={updateProfile}
        onSignOut={signOut}
      />
    </form>
  );
}