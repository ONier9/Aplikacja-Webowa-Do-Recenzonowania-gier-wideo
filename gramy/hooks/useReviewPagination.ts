import { useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseReviewPaginationOptions {
  gameId: number;
  onPageChange: (page: number, sort: "created_at" | "likes") => void;
  onSortChange: (sort: "created_at" | "likes") => void;
}

export function useReviewPagination({
  gameId,
  onPageChange,
  onSortChange,
}: UseReviewPaginationOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const sortBy = (searchParams.get("sortBy") as "created_at" | "likes") || "created_at";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const scrollToReviews = useCallback(() => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: "created_at" | "likes") => {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("sortBy", newSortBy);
      router.push(`/game/${gameId}?${params.toString()}`);
      onSortChange(newSortBy);
      scrollToReviews();
    },
    [gameId, router, onSortChange, scrollToReviews]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("sortBy", sortBy);
      router.push(`/game/${gameId}?${params.toString()}`);
      onPageChange(page, sortBy);
      scrollToReviews();
    },
    [gameId, router, sortBy, onPageChange, scrollToReviews]
  );

  return {
    currentPage,
    sortBy,
    reviewsSectionRef,
    handleSortChange,
    handlePageChange,
  };
}