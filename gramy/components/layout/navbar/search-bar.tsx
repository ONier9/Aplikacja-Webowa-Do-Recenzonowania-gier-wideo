import { FormEvent } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

interface SearchBarProps {
  searchQuery: string;
  suggestions: any[];
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onSuggestionClick: (suggestion: any) => void;
  className?: string;
  isMobile?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  suggestions,
  onSearchChange,
  onSearchSubmit,
  onSuggestionClick,
  className = "",
  isMobile = false,
}) => {
  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={onSearchSubmit}
        className="flex items-center space-x-2 border rounded-md p-2"
      >
        <Search className="h-5 w-5 text-stone-600" />
        <input
          type="text"
          placeholder="Find a game..."
          className="outline-none w-40"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </form>

      <Link
        href="/search"
        className={`text-xs text-stone-400 hover:text-teal-400 ${isMobile ? "block mt-1 ml-2" : "absolute -bottom-5 left-2"}`}
      >
        Advanced search
      </Link>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border rounded-md shadow-lg z-10">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-2 text-stone-300 hover:bg-teal-700 hover:text-white cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
