interface SortControlsProps {
  sortBy: "created_at" | "likes" | "rating";
  onSortChange: (sortBy: string) => void;
}

export function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  return (
    <div className="mb-6 flex justify-end">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
      >
        <option value="created_at">Newest First</option>
        <option value="likes">Most Liked</option>
      </select>
    </div>
  );
}