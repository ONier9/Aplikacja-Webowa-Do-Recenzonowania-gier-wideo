interface FormActionsProps {
  loading: boolean;
  disabled: boolean;
  onSave: () => void;
  onSignOut: () => void;
}

export function FormActions({ loading, disabled, onSave, onSignOut }: FormActionsProps) {
  return (
    <div className="flex space-x-2 items-center">
      <button
        type="button"
        disabled={loading || disabled}
        onClick={onSave}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>

      <button
        type="button"
        onClick={onSignOut}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}