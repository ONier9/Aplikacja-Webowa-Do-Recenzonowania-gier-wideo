"use client";

import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { useState, KeyboardEvent } from "react";

type AdvancedPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function AdvancedPagination({
  currentPage,
  totalPages,
  onPageChange,
}: AdvancedPaginationProps) {
  const [inputPage, setInputPage] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setInputPage("");
      setShowInput(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    } else if (e.key === 'Escape') {
      setInputPage("");
      setShowInput(false);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 my-8">

      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="group relative px-4 py-2.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-800/80 transition-all flex items-center gap-2 border border-neutral-700/50 hover:border-neutral-600"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
        <span className="text-sm font-medium">
          <span className="text-teal-400">{currentPage}</span>
          <span className="text-neutral-500 mx-1">/</span>
          <span className="text-neutral-400">{totalPages}</span>
        </span>
      </div>

      {totalPages > 3 && (
        <div className="relative">
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="px-4 py-2.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 transition-all flex items-center gap-2 border border-neutral-700/50 hover:border-teal-500/50 group"
              title="Jump to page"
            >
              <Hash className="w-4 h-4 text-neutral-400 group-hover:text-teal-400 transition-colors" />
              <span className="text-sm font-medium text-neutral-400 group-hover:text-teal-400 transition-colors hidden sm:inline">
                Jump
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg border border-teal-500/50 shadow-lg shadow-teal-500/10">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  setTimeout(() => {
                    if (!inputPage) setShowInput(false);
                  }, 200);
                }}
                placeholder="Page"
                autoFocus
                className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-sm text-center focus:outline-none focus:border-teal-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleGoToPage}
                disabled={!inputPage || parseInt(inputPage) < 1 || parseInt(inputPage) > totalPages}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded text-sm font-medium transition-all"
              >
                Go
              </button>
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="group relative px-4 py-2.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-800/80 transition-all flex items-center gap-2 border border-neutral-700/50 hover:border-neutral-600"
        aria-label="Next page"
      >
        <span className="text-sm font-medium hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}