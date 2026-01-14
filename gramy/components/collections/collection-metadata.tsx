import { Folder, Calendar } from 'lucide-react';

interface CollectionMetadataProps {
  gameCount: number;
  createdAt: string;
  updatedAt: string;
  createdDate: string;
  updatedDate: string;
}

export function CollectionMetadata({
  gameCount,
  createdAt,
  updatedAt,
  createdDate,
  updatedDate,
}: CollectionMetadataProps) {
  const hasUpdates = updatedDate !== createdDate;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4" />
        <span>{gameCount} {gameCount === 1 ? 'game' : 'games'}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>Created {createdAt}</span>
      </div>
      
      {hasUpdates && (
        <div className="flex items-center gap-2">
          <span className="text-xs">•</span>
          <span>Updated {updatedAt}</span>
        </div>
      )}
    </div>
  );
}