import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface CollectionActionButtonsProps {
  isPublic: boolean;
  onToggleVisibility?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isPending: boolean;
  isDeleting: boolean;
}

export function CollectionActionButtons({
  isPublic,
  onToggleVisibility,
  onEdit,
  onDelete,
  isPending,
  isDeleting,
}: CollectionActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onToggleVisibility}
        disabled={isPending}
        className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-gray-700"
        title={isPublic ? 'Make private' : 'Make public'}
      >
        {isPublic ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={onEdit}
        disabled={isPending}
        className="p-3 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700"
        title="Edit collection"
      >
        <Edit2 className="w-5 h-5" />
      </button>

      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="p-3 text-red-400 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors border border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete collection"
      >
        {isDeleting ? (
          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}