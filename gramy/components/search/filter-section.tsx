import { useState, useRef } from "react";
import { FilterOption } from "@/services/advancedGameService";
import { Search, X } from "lucide-react";

interface FilterSectionProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchResults: FilterOption[];
  onAddItem: (item: FilterOption) => void;
  selectedItems: any[];
  onRemoveItem: (id: number) => void;
  renderSelectedItem: (item: any) => { id: number; name: string };
  placeholder: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  searchValue,
  onSearchChange,
  searchResults,
  onAddItem,
  selectedItems,
  onRemoveItem,
  renderSelectedItem,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showResults =
    isOpen && searchValue.trim().length > 0 && searchResults.length > 0;

  const handleSelect = (item: FilterOption) => {
    onAddItem(item);
    onSearchChange("");
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="bg-neutral-800 p-4 rounded-md relative"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
    >
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <div className="flex items-center border rounded-md p-2 bg-neutral-700">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-white"
          value={searchValue}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {showResults && (
        <div className="absolute z-20 w-full mt-1 bg-neutral-700 border border-neutral-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((item) => (
            <button
              key={item.igdb_id}
              type="button"
              className="w-full text-left p-2 hover:bg-teal-600 transition-colors"
              onMouseDown={() => handleSelect(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedItems.map((item) => {
            const { id, name } = renderSelectedItem(item);
            return (
              <div
                key={id}
                className="flex items-center bg-teal-700 rounded-full px-3 py-1"
              >
                <span className="mr-2 text-sm">{name}</span>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveItem(id);
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
