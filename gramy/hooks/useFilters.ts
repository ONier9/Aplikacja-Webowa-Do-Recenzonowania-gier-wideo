import { useEffect, useState } from "react";
import {
  FilterOption,
  getAllGenres,
  getAllPlatforms,
} from "@/services/advancedGameService";

export const useFilters = () => {
  const [genres, setGenres] = useState<FilterOption[]>([]);
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [genresData, platformsData] = await Promise.all([
          getAllGenres(),
          getAllPlatforms(),
        ]);
        setGenres(genresData);
        setPlatforms(platformsData);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  return { genres, platforms, loading };
};
