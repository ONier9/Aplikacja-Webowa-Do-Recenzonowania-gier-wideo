'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Folder, Lock, Eye, ChevronRight, Plus } from 'lucide-react'; 
import { CollectionWithGames } from '@/services/collectionsService';
import { useModal } from '@/context/ModalContext';

interface UserCollectionsDisplayProps {
  collections: CollectionWithGames[];
  isOwnProfile: boolean;
}

export default function UserCollectionsDisplay({ 
  collections,
  isOwnProfile 
}: UserCollectionsDisplayProps) {
  
  const { openCreateCollectionModal } = useModal(); 

  if (collections.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
        <Folder className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-400" />
        <p className="text-gray-400 mb-6">
          {isOwnProfile ? "You haven't created any collections yet." : "No collections yet."}
        </p>

        {isOwnProfile && (
          <button
            onClick={() => openCreateCollectionModal()}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-colors font-medium shadow-md shadow-purple-900/50"
          >
            <Plus className="w-5 h-5" />
            Create First Collection
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-4">
        {isOwnProfile && (
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => openCreateCollectionModal()} 
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md shadow-purple-900/50"
                >
                    <Plus className="w-4 h-4" />
                    New Collection
                </button>
            </div>
        )}
        
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collection/${collection.id}`}
          className="block bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4 flex-1">
              <Folder className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                  {collection.is_public ? (
                    <Eye className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                {collection.description && (
                  <p className="text-gray-400 text-sm mb-2">{collection.description}</p>
                )}
                <p className="text-gray-500 text-sm">{collection.game_count} games</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}