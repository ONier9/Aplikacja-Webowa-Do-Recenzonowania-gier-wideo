'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateCollection, deleteCollection } from '@/actions/collections';
import { toggleGameInCollection } from '@/actions/collections/';
import type { CollectionWithStats } from '@/types/collections';
import { CreatorInfo } from '@/components/collections/creator-info';
import { CollectionHeader } from '@/components/collections/collection-header';
import { GamesSection } from '@/components/collections/games-section';

interface CollectionDetailClientProps {
  collection: CollectionWithStats;
  games: Array<{
    igdb_id: number;
    name: string;
    cover_url: string | null;
    added_at: string;
  }>;
  isOwner: boolean;
  isSystemCollection: boolean;
  creatorUsername?: string;
  creatorAvatar?: string | null;
  creatorFullName?: string | null;
}

export default function CollectionDetailClient({ 
  collection: initialCollection, 
  games: initialGames,
  isOwner,
  isSystemCollection,
  creatorUsername,
  creatorAvatar,
  creatorFullName
}: CollectionDetailClientProps) {
  const [collection, setCollection] = useState(initialCollection);
  const [games, setGames] = useState(initialGames);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: collection.name,
    description: collection.description || '',
    isPublic: collection.is_public
  });
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formattedCreatedAt = formatDate(collection.created_at);
  const formattedUpdatedAt = formatDate(collection.updated_at);

  const handleToggleVisibility = async () => {
    startTransition(async () => {
      const result = await updateCollection(collection.id, {
        is_public: !collection.is_public
      });

      if (result.success && result.data) {
        setCollection({ ...collection, is_public: result.data.is_public });
        toast.success(`Collection is now ${result.data.is_public ? 'public' : 'private'}`);
      } else {
        toast.error(result.error || 'Failed to update visibility');
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    startTransition(async () => {
      const result = await updateCollection(collection.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        is_public: editForm.isPublic
      });

      if (result.success && result.data) {
        setCollection({ ...collection, ...result.data });
        setIsEditing(false);
        toast.success('Collection updated successfully');
      } else {
        toast.error(result.error || 'Failed to update collection');
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: collection.name,
      description: collection.description || '',
      isPublic: collection.is_public
    });
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveGame = async (gameId: number) => {
    if (!confirm('Remove this game from the collection?')) return;

    startTransition(async () => {
      const result = await toggleGameInCollection(collection.id, gameId);
      if (result.success) {
        setGames(games.filter(g => g.igdb_id !== gameId));
        setCollection({ ...collection, game_count: collection.game_count - 1 });
        toast.success('Game removed from collection');
      } else {
        toast.error(result.error || 'Failed to remove game');
      }
    });
  };

  const handleDeleteCollection = async () => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success('Collection deleted successfully');
        setTimeout(() => {
          router.push(`/profile/${creatorUsername}`);
          router.refresh();
        }, 1000);
      } else {
        toast.error(result.error || 'Failed to delete collection');
        setIsDeleting(false);
      }
    } catch (error: any) {
      console.error('Failed to delete collection:', error);
      toast.error(error.message || 'An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {creatorUsername && (
        <CreatorInfo
          creatorUsername={creatorUsername}
          creatorAvatar={creatorAvatar}
          creatorFullName={creatorFullName}
          isOwner={isOwner}
          isPublic={collection.is_public}
        />
      )}

      <CollectionHeader
        collection={collection}
        isOwner={isOwner}
        isSystemCollection={isSystemCollection}
        formattedCreatedAt={formattedCreatedAt}
        formattedUpdatedAt={formattedUpdatedAt}
        onEdit={() => setIsEditing(true)}
        onToggleVisibility={handleToggleVisibility}
        onDelete={handleDeleteCollection}
        isEditing={isEditing}
        editForm={editForm}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onEditFormChange={handleEditFormChange}
        isPending={isPending}
        isDeleting={isDeleting}
      />

      <GamesSection
        games={games}
        isOwner={isOwner}
        isSystemCollection={isSystemCollection}
        onRemove={handleRemoveGame}
      />
    </div>
  );
}