import { useState, useEffect, useCallback } from "react";
import {
  getFilteredGamesAction,
  getAllGenresAction,
  getAllPlatformsAction,
  searchCompaniesAction,
  searchPlatformsAction,
} from "@/actions/gameActions";
import { useDebouncedValue } from "./useDebouncedValue";
import type { FilterOption, GameSearchResult } from "@/types/game.types";

export const useAdvancedSearch = () => {
  const [genres, setGenres] = useState<FilterOption[]>([]);
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<FilterOption[]>([]);

  const [companySearch, setCompanySearch] = useState("");
  const [platformSearch, setPlatformSearch] = useState("");
  const [companyResults, setCompanyResults] = useState<FilterOption[]>([]);
  const [platformResults, setPlatformResults] = useState<FilterOption[]>([]);

  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedCompanySearch = useDebouncedValue(companySearch, 300);
  const debouncedPlatformSearch = useDebouncedValue(platformSearch, 300);

  useEffect(() => {
    const loadInitialData = async () => {
      const [genresResult, platformsResult] = await Promise.all([
        getAllGenresAction(),
        getAllPlatformsAction(),
      ]);

      if (genresResult.success && genresResult.data) {
        setGenres(genresResult.data);
      }
      if (platformsResult.success && platformsResult.data) {
        setPlatforms(platformsResult.data);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const searchCompanies = async () => {
      if (debouncedCompanySearch.trim().length < 2) {
        setCompanyResults([]);
        return;
      }

      const result = await searchCompaniesAction(debouncedCompanySearch);
      if (result.success && result.data) {
        setCompanyResults(result.data);
      }
    };

    searchCompanies();
  }, [debouncedCompanySearch]);

  useEffect(() => {
    const searchPlatforms = async () => {
      if (debouncedPlatformSearch.trim().length < 2) {
        setPlatformResults([]);
        return;
      }

      const result = await searchPlatformsAction(debouncedPlatformSearch);
      if (result.success && result.data) {
        setPlatformResults(result.data);
      }
    };

    searchPlatforms();
  }, [debouncedPlatformSearch]);

  const toggleGenre = useCallback((id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

  const togglePlatform = useCallback((id: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const addPlatform = useCallback((platform: FilterOption) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform.igdb_id)) return prev;
      return [...prev, platform.igdb_id];
    });
    setPlatformSearch("");
    setPlatformResults([]);
  }, []);

  const removePlatform = useCallback((id: number) => {
    setSelectedPlatforms((prev) => prev.filter((p) => p !== id));
  }, []);

  const addCompany = useCallback((company: FilterOption) => {
    setSelectedCompanies((prev) => {
      if (prev.some((c) => c.igdb_id === company.igdb_id)) return prev;
      return [...prev, company];
    });
    setCompanySearch("");
    setCompanyResults([]);
  }, []);

  const removeCompany = useCallback((id: number) => {
    setSelectedCompanies((prev) => prev.filter((c) => c.igdb_id !== id));
  }, []);

  const fetchGames = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getFilteredGamesAction(
          selectedPlatforms.length > 0 ? selectedPlatforms : null,
          selectedGenres.length > 0 ? selectedGenres : null,
          selectedCompanies.length > 0 ? selectedCompanies.map(c => c.igdb_id) : null,
          page
        );

        if (result.success) {
          setGames(result.data || []);
          setTotalCount(result.total_count || 0);
        } else {
          setError(result.error || "Failed to fetch games");
          setGames([]);
          setTotalCount(0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setGames([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [selectedPlatforms, selectedGenres, selectedCompanies]
  );

  return {
    genres,
    platforms,

    selectedGenres,
    selectedPlatforms,
    selectedCompanies,

    companySearch,
    platformSearch,
    companyResults,
    platformResults,

    games,
    totalCount,
    loading,
    error,

    setCompanySearch,
    setPlatformSearch,
    fetchGames,
    toggleGenre,
    togglePlatform,
    addPlatform,
    addCompany,
    removeCompany,
    removePlatform,
  };
};