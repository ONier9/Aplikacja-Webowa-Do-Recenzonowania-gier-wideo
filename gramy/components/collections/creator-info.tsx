import { User, Globe, Lock } from 'lucide-react';

interface CreatorInfoProps {
  creatorUsername: string;
  creatorAvatar?: string | null;
  creatorFullName?: string | null;
  isOwner: boolean;
  isPublic: boolean;
}

export function CreatorInfo({
  creatorUsername,
  creatorAvatar,
  creatorFullName,
  isOwner,
  isPublic,
}: CreatorInfoProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
      <div className="inline-flex items-center gap-3 text-gray-300 bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-3">
          <CreatorAvatar 
            avatar={creatorAvatar} 
            fullName={creatorFullName} 
            username={creatorUsername} 
            isPublic={isPublic} 
          />
          
          <div className="flex flex-col text-left">
            <span className="text-xs text-gray-400">
              {isOwner ? 'Your collection' : 'Collection by'}
            </span>
            <span className="font-medium">
              {creatorFullName || creatorUsername}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatorAvatar({ 
  avatar, 
  fullName, 
  username,
  isPublic 
}: { 
  avatar?: string | null; 
  fullName?: string | null; 
  username: string;
  isPublic: boolean;
}) {
  return (
    <div className="relative">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
        {avatar ? (
          <img 
            src={avatar} 
            alt={fullName || username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
        {isPublic ? (
          <Globe className="w-3 h-3 text-green-400" />
        ) : (
          <Lock className="w-3 h-3 text-amber-400" />
        )}
      </div>
    </div>
  );
}