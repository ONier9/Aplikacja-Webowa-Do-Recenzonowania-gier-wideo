import { notFound } from "next/navigation";
import { getCollectionById } from "@/actions/collections";
import { getCollectionGames } from "@/actions/collections/";
import { createClient } from "@/utils/supabase/server";
import CollectionDetailClient from "./_CollectionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  const collectionResult = await getCollectionById(id);
  
  if (!collectionResult.success || !collectionResult.data) {
    return notFound();
  }

  const collection = collectionResult.data;
  const isOwner = currentUser?.id === collection.user_id;
  
  let creatorUsername = 'User';
  let creatorAvatar = null;
  let creatorFullName = null;
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, full_name')
      .eq('id', collection.user_id)
      .single();
    
    if (profile) {
      creatorUsername = profile.username || 'User';
      creatorAvatar = profile.avatar_url;
      creatorFullName = profile.full_name;
    }
  } catch (error) {
    console.error('Failed to fetch creator profile:', error);
  }
  
  const gamesResult = await getCollectionGames(id);
  const games = gamesResult.success ? gamesResult.data || [] : [];

  return (
    <CollectionDetailClient
      collection={collection}
      games={games}
      isOwner={isOwner}
      isSystemCollection={collection.is_system}
      creatorUsername={creatorUsername}
      creatorAvatar={creatorAvatar}
      creatorFullName={creatorFullName}
    />
  );
}