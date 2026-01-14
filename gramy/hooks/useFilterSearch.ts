import { useState, useEffect, useCallback } from "react";
import { FilterOption, searchCompanies, filterPlatforms } from "@/services/search";

const DEBOUNCE_DELAY = 300;

export function useFilterSearch(allPlatforms: FilterOption[]) {
  const [companySearch, setCompanySearch] = useState("");
  const [companyResults, setCompanyResults] = useState<FilterOption[]>([]);
  const [platformSearch, setPlatformSearch] = useState("");
  const [platformResults, setPlatformResults] = useState<FilterOption[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!companySearch.trim()) {
        setCompanyResults([]);
        return;
      }
      try {
        const results = await searchCompanies(companySearch);
        setCompanyResults(results);
      } catch (error) {
        console.error("[useFilterSearch] Company search failed:", error);
        setCompanyResults([]);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [companySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!platformSearch.trim()) {
        setPlatformResults([]);
        return;
      }
      const results = filterPlatforms(allPlatforms, platformSearch);
      setPlatformResults(results);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [platformSearch, allPlatforms]);

  const clearCompanySearch = useCallback(() => {
    setCompanySearch("");
    setCompanyResults([]);
  }, []);

  const clearPlatformSearch = useCallback(() => {
    setPlatformSearch("");
    setPlatformResults([]);
  }, []);

  return {
    companySearch,
    setCompanySearch,
    companyResults,
    clearCompanySearch,
    platformSearch,
    setPlatformSearch,
    platformResults,
    clearPlatformSearch,
  };
}