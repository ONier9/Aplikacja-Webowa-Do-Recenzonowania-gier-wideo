import { useState, useCallback } from "react";
import { FilterOption } from "@/services/search";

export function useSearchFilters() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<FilterOption[]>([]);

  const toggleGenre = useCallback((igdb_id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(igdb_id)
        ? prev.filter((id) => id !== igdb_id)
        : [...prev, igdb_id]
    );
  }, []);

  const togglePlatform = useCallback((igdb_id: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(igdb_id)
        ? prev.filter((id) => id !== igdb_id)
        : [...prev, igdb_id]
    );
  }, []);

  const addPlatform = useCallback((platform: FilterOption) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform.igdb_id)) return prev;
      return [...prev, platform.igdb_id];
    });
  }, []);

  const addCompany = useCallback((company: FilterOption) => {
    setSelectedCompanies((prev) => {
      if (prev.some((c) => c.igdb_id === company.igdb_id)) return prev;
      return [...prev, company];
    });
  }, []);

  const removeCompany = useCallback((igdb_id: number) => {
    setSelectedCompanies((prev) => prev.filter((c) => c.igdb_id !== igdb_id));
  }, []);

  const removePlatform = useCallback((igdb_id: number) => {
    setSelectedPlatforms((prev) => prev.filter((id) => id !== igdb_id));
  }, []);

  const hasFilters = selectedGenres.length > 0 || 
                     selectedPlatforms.length > 0 || 
                     selectedCompanies.length > 0;

  const clearFilters = useCallback(() => {
    setSelectedGenres([]);
    setSelectedPlatforms([]);
    setSelectedCompanies([]);
  }, []);

  return {
    selectedGenres,
    selectedPlatforms,
    selectedCompanies,
    toggleGenre,
    togglePlatform,
    addPlatform,
    addCompany,
    removeCompany,
    removePlatform,
    hasFilters,
    clearFilters,
  };
}