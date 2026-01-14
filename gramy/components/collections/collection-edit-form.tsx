interface CollectionEditFormProps {
  editForm: {
    name: string;
    description: string;
    isPublic: boolean;
  };
  onFormChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CollectionEditForm({
  editForm,
  onFormChange,
  onSave,
  onCancel,
  isPending,
}: CollectionEditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Collection Name
        </label>
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          maxLength={100}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none text-xl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={editForm.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is-public"
          checked={editForm.isPublic}
          onChange={(e) => onFormChange('isPublic', e.target.checked)}
          className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="is-public" className="text-sm text-gray-300">
          Public (anyone can view)
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={isPending || !editForm.name.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}