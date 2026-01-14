"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; 
import JoinButton from "@/components/page-elements/register-button";

export default function UserGreeting() {
  const { user, username, loading, error } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('[UserGreeting] State:', { 
      user: user?.id, 
      username, 
      loading,
      error,
      mounted 
    });
  }, [user, username, loading, error, mounted]);

  if (!mounted) {
    return (
      <div className="text-gray-400 text-center mb-8 h-8">
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-center mb-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    console.error('[UserGreeting] Error:', error);
  }

  if (user && username) {
    return (
      <div className="text-white text-lg font-semibold flex justify-center mb-8">
        Hi, {username}!
      </div>
    );
  }

  if (user && !username) {
    return (
      <div className="text-gray-400 text-center mb-8">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return <JoinButton isLoggedIn={false} />;
}