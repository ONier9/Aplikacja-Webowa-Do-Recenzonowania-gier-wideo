import { Folder, Calendar } from 'lucide-react';
import { CollectionWithStats } from '@/types/collections';
import { CollectionPrivacyBadge } from './collection-privacy-badge';
import { CollectionMetadata } from './collection-metadata';
import { CollectionActionButtons } from './collection-action-buttons';

interface CollectionHeaderContentProps {
  collection: CollectionWithStats;
  isOwner: boolean;
  isSystemCollection: boolean;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function CollectionHeaderContent({
  collection,
  isOwner,
  isSystemCollection,
  formattedCreatedAt,
  formattedUpdatedAt,
  onEdit,
  onToggleVisibility,
  onDelete,
  isPending,
  isDeleting,
}: CollectionHeaderContentProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
              <Folder className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
              <CollectionPrivacyBadge 
                isPublic={collection.is_public} 
                isSystemCollection={isSystemCollection} 
              />
            </div>
            
            {collection.description && collection.description !== 'SYSTEM_STATUS_COLLECTION' && (
              <p className="text-gray-300 mb-4">{collection.description}</p>
            )}
            
            <CollectionMetadata 
              gameCount={collection.game_count}
              createdAt={formattedCreatedAt}
              updatedAt={formattedUpdatedAt}
              createdDate={collection.created_at}
              updatedDate={collection.updated_at}
            />
          </div>
        </div>

        {isOwner && !isSystemCollection && (
          <CollectionActionButtons
            isPublic={collection.is_public}
            onToggleVisibility={onToggleVisibility}
            onEdit={onEdit}
            onDelete={onDelete}
            isPending={isPending}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </>
  );
}