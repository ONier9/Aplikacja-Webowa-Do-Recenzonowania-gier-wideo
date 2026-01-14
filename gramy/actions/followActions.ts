"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Follower {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  followed_at?: string;
  mutualFollowers?: number;
}

export interface FollowStats {
  followers: number;
  following: number;
}

export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (user.id === targetUserId) {
    return { success: false, error: "Cannot follow yourself" };
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    return { success: true }; 
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetUserId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile/[username]", "page");
  revalidatePath("/profile/[username]/followers", "page");
  
  return { success: true };
}

export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile/[username]", "page");
  revalidatePath("/profile/[username]/followers", "page");
  
  return { success: true };
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return !!data;
}

export async function getFollowers(userId: string, limit?: number): Promise<Follower[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("follows")
    .select(`
      created_at,
      follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url)
    `)
    .eq("following_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching followers:", error);
    return [];
  }

  return (data || []).map((follow: any) => ({
    id: follow.follower.id,
    username: follow.follower.username,
    full_name: follow.follower.full_name,
    avatar_url: follow.follower.avatar_url,
    followed_at: follow.created_at,
  }));
}

export async function getFollowing(userId: string, limit?: number): Promise<Follower[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from("follows")
    .select(`
      created_at,
      following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url)
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching following:", error);
    return [];
  }

  return (data || []).map((follow: any) => ({
    id: follow.following.id,
    username: follow.following.username,
    full_name: follow.following.full_name,
    avatar_url: follow.following.avatar_url,
    followed_at: follow.created_at,
  }));
}

export async function getFollowStats(userId: string): Promise<FollowStats> {
  const supabase = await createClient();
  
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
  };
}