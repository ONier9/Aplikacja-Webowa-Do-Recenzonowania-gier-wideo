import { FilterSection } from "@/components/search/filter-section";
import { GenreFilter } from "@/components/search/genre-filter";
import { Search } from "lucide-react";
import type { FilterOption } from "@/types/game.types";

interface SearchFormProps {
  loading: boolean;
  hasFilters: boolean;
  platformSearch: string;
  setPlatformSearch: (val: string) => void;
  platformResults: any[];
  addPlatform: (platform: FilterOption) => void;
  selectedPlatforms: number[];
  removePlatform: (id: number) => void;
  companySearch: string;
  setCompanySearch: (val: string) => void;
  companyResults: FilterOption[];
  addCompany: (company: FilterOption) => void;
  selectedCompanies: FilterOption[];removeCompany: (id: number) => void; 
   removeCompany: (company: FilterOption) => void;
  genres: any[];
  selectedGenres: number[];
  toggleGenre: (id: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  platforms: FilterOption[]; 
}

export default function SearchForm({
  loading,
  hasFilters,
  platformSearch,
  setPlatformSearch,
  platformResults,
  addPlatform,
  selectedPlatforms,
  removePlatform,
  companySearch,
  setCompanySearch,
  companyResults,
  addCompany,
  selectedCompanies,
  removeCompany,
  genres,
  selectedGenres,
  toggleGenre,
  platforms,
  onSubmit,
}: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-12">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700/50 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FilterSection
            title="Platforms"
            searchValue={platformSearch}
            onSearchChange={setPlatformSearch}
            searchResults={platformResults}
            onAddItem={addPlatform}
            selectedItems={selectedPlatforms}
            onRemoveItem={removePlatform}
            renderSelectedItem={(id: number) => ({
              id,
              name: platforms.find((p) => p.igdb_id === id)?.name || "Unknown",
            })}
            placeholder="Search platforms..."
          />

          <FilterSection
            title="Companies"
            searchValue={companySearch}
            onSearchChange={setCompanySearch}
            searchResults={companyResults}
            onAddItem={addCompany}
            selectedItems={selectedCompanies}
            onRemoveItem={removeCompany}
            renderSelectedItem={(company: FilterOption) => ({
              id: company.igdb_id,
              name: company.name,
            })}
            placeholder="Search companies..."
          />
        </div>

        <div className="mb-6">
          <GenreFilter
            genres={genres}
            selectedGenres={selectedGenres}
            onToggleGenre={toggleGenre}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="submit"
            disabled={loading || !hasFilters}
            className="group relative px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search Games</span>
              </>
            )}
          </button>

          {!hasFilters && (
            <span className="text-sm text-gray-400">
              Select at least one filter
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
