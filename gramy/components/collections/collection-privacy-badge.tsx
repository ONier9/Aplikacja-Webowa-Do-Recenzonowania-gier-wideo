import { Globe, Lock } from 'lucide-react';

interface CollectionPrivacyBadgeProps {
  isPublic: boolean;
  isSystemCollection: boolean;
}

export function CollectionPrivacyBadge({ isPublic, isSystemCollection }: CollectionPrivacyBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {isPublic ? (
        <span className="flex items-center gap-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
          <Globe className="w-3 h-3" />
          Public
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded">
          <Lock className="w-3 h-3" />
          Private
        </span>
      )}
      {isSystemCollection && (
        <span className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
          System
        </span>
      )}
    </div>
  );
}