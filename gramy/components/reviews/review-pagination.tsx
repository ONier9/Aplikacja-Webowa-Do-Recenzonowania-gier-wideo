"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export default function ReviewPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || isLoading) return;
    
    setIsLoading(true);
    
    if (onPageChange) {
      onPageChange(page);
    }
    
    setTimeout(() => setIsLoading(false), 500);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 my-8">
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Previous</span>
        </button>
      )}
      
      <div className="flex items-center gap-2">
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        
        {isLoading && (
          <div className="ml-2 w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1"
          aria-label="Next page"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
} 