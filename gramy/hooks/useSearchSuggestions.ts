import { useState, useEffect } from "react";
import { getGameSuggestions } from "@/actions/gameActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { GameSuggestion } from "@/types";

export const useSearchSuggestions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length > 1) {
        try {
          const result = await getGameSuggestions(debouncedQuery, 5);

          if (result?.success && Array.isArray(result.data)) {
            setSuggestions(result.data);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error("[useSearchSuggestions] Error fetching suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const clearSuggestions = () => {
    setSuggestions([]);
    setSearchQuery("");
  };

  return {
    searchQuery,
    suggestions,
    setSearchQuery,
    clearSuggestions,
  };
};
