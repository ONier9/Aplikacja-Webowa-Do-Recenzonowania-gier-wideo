import { CollectionEditForm } from './collection-edit-form';
import { CollectionHeaderContent } from './collection-header-content';

interface CollectionHeaderProps {
  collection: any;
  isOwner: boolean;
  isSystemCollection: boolean;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  editForm?: any;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditFormChange?: (field: string, value: any) => void;
  isPending?: boolean;
  isDeleting?: boolean;
}

export function CollectionHeader({
  collection,
  isOwner,
  isSystemCollection,
  formattedCreatedAt,
  formattedUpdatedAt,
  onEdit,
  onToggleVisibility,
  onDelete,
  isEditing = false,
  editForm,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  isPending = false,
  isDeleting = false,
}: CollectionHeaderProps) {
  if (isEditing && editForm) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-8 mb-8">
        <CollectionEditForm
          editForm={editForm}
          onFormChange={onEditFormChange}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          isPending={isPending}
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-8 mb-8">
      <CollectionHeaderContent
        collection={collection}
        isOwner={isOwner}
        isSystemCollection={isSystemCollection}
        formattedCreatedAt={formattedCreatedAt}
        formattedUpdatedAt={formattedUpdatedAt}
        onEdit={onEdit}
        onToggleVisibility={onToggleVisibility}
        onDelete={onDelete}
        isPending={isPending}
        isDeleting={isDeleting}
      />
    </div>
  );
}