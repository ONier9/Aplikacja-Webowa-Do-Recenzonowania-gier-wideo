import GameGrid from "@/components/page-elements/game-grid";
import AdvancedPagination from "@/components/page-elements/advanced-pagination";
import { SlidersHorizontal, Search } from "lucide-react";
interface SearchResultsProps {
  games: any[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  hasFilters: boolean;
}

export default function SearchResults({
  games,
  totalCount,
  currentPage,
  onPageChange,
  loading,
  hasFilters,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4" />
        <p className="text-gray-400 text-lg">Finding games for you...</p>
      </div>
    );
  }

  if (games.length === 0 && hasFilters) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-4">
          <Search className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No games found</h3>
        <p className="text-gray-400 mb-6">
          Try adjusting your filters or selecting different criteria
        </p>
      </div>
    );
  }

  if (!hasFilters) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-4">
          <SlidersHorizontal className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Ready to search</h3>
        <p className="text-gray-400">
          Select your filters above and click "Search Games" to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-gray-300">
          <span className="text-2xl font-bold text-white">{totalCount.toLocaleString()}</span>{" "}
          <span className="text-lg">{totalCount === 1 ? "game" : "games"} found</span>
        </div>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {Math.ceil(totalCount / 20)}
        </div>
      </div>

      <GameGrid games={games} />

      {totalCount > 20 && (
        <div className="mt-8">
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / 20)}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
