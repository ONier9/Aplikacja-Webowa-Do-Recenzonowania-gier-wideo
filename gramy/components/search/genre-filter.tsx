import type { FilterOption } from "@/types/game.types";

interface GenreFilterProps {
  genres: FilterOption[];
  selectedGenres: number[];
  onToggleGenre: (id: number) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenres,
  onToggleGenre,
}) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-3 text-white">Genres</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.igdb_id);
          return (
            <label
              key={genre.igdb_id}
              className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors ${
                isSelected
                  ? "bg-teal-600/20 hover:bg-teal-600/30"
                  : "hover:bg-gray-700/50"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleGenre(genre.igdb_id)}
                className="mr-2 h-4 w-4 accent-teal-500 cursor-pointer"
              />
              <span className="text-white text-sm">{genre.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};