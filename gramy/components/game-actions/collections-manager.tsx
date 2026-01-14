'use client';

import { useState } from 'react';
import { Folder, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import {
  toggleGameInCollection
} from '@/actions/collections/';
import type { CollectionWithStats } from '@/types/collections';

interface CollectionUI extends CollectionWithStats {
  has_game: boolean;
}

interface CollectionsManagerProps {
  gameId: number;
  gameName: string;
  initialCollections?: CollectionWithStats[];
  initialGameInCollections?: string[];
}

export default function CollectionsManager({
  gameId,
  gameName,
  initialCollections = [],
  initialGameInCollections = []
}: CollectionsManagerProps) {
  const { user } = useAuth();
  const { openLogin, openCreateCollectionModal } = useModal();

  const [collections, setCollections] = useState<CollectionUI[]>(
    () =>
      initialCollections
        .filter(c => !c.is_system)
        .map(c => ({
          ...c,
          has_game: initialGameInCollections.includes(c.id)
        }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggle = async (collectionId: string) => {
    if (!user) {
      openLogin();
      return;
    }

    setIsLoading(true);

    try {
      const result = await toggleGameInCollection(collectionId, gameId);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update collection');
      }

      setCollections(prev =>
        prev.map(c =>
          c.id === collectionId
            ? {
                ...c,
                has_game: result.data.isInCollection,
                game_count: result.data.isInCollection
                  ? c.game_count + 1
                  : c.game_count - 1
              }
            : c
        )
      );
    } catch (error) {
      console.error('toggleGameInCollection failed:', error);
      alert('Failed to update collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = () => {
    if (!user) {
      openLogin();
      return;
    }

    openCreateCollectionModal(gameId, gameName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!user) {
            openLogin();
            return;
          }
          setIsDropdownOpen(prev => !prev);
        }}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isDropdownOpen
            ? 'bg-purple-700 text-white'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Folder className="w-4 h-4" />
        )}
        Save to Collection
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />

          <div className="absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
            <div className="border-b border-gray-700 p-3">
              <h3 className="mb-2 text-sm font-medium text-white">
                Your Collections
              </h3>
              <button
                onClick={handleCreateCollection}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Create New Collection
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {collections.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="mb-1 text-sm text-gray-400">
                    No custom collections yet.
                  </p>
                  <p className="text-xs text-gray-500">
                    Create one to organize your games
                  </p>
                </div>
              ) : (
                collections.map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => handleToggle(collection.id)}
                    disabled={isLoading}
                    className="group flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-750 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white group-hover:text-purple-300 transition-colors">
                          {collection.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({collection.game_count})
                        </span>
                      </div>
                    </div>

                    {collection.has_game && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
