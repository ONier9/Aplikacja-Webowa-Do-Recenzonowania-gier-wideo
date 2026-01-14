import { useState } from "react";
import {
  FilterOption,
  GameSearchResult,
  getFilteredGames,
} from "@/services/advancedGameService";

export const useGameSearch = () => {
  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchGames = async (
    platforms: number[] | null,
    genres: number[] | null,
    companies: FilterOption[] | null,
    pageNum = 1
  ) => {
    setLoading(true);
    try {
      const companyIds = companies?.map((c) => c.igdb_id) || null;
      const result = await getFilteredGames(
        platforms,
        genres,
        companyIds,
        pageNum
      );
      setGames(result.data);
      setTotalCount(result.total_count);
      return result;
    } catch (err) {
      console.error("Game fetch failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { games, totalCount, loading, fetchGames };
};
