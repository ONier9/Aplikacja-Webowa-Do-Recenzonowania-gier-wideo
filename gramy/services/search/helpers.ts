import { RawGameSearchResult, RawFilterOption } from "./repository";

export type GameSearchResult = {
  igdb_id: number;
  name: string;
  cover_url: string | null;
};

export type FilterOption = {
  igdb_id: number;
  name: string;
};

export type SearchResult = {
  data: GameSearchResult[];
  total_count: number;
};

export function transformGameResults(rawData: RawGameSearchResult[]): SearchResult {
  if (!rawData || rawData.length === 0) {
    return {
      data: [],
      total_count: 0,
    };
  }

  return {
    data: rawData.map((item) => ({
      igdb_id: item.igdb_id,
      name: item.name,
      cover_url: item.cover_url,
    })),
    total_count: rawData[0]?.total_count || 0,
  };
}

export function transformFilterOptions(rawData: RawFilterOption[]): FilterOption[] {
  return rawData.map((item) => ({
    igdb_id: item.igdb_id,
    name: item.name,
  }));
}

export function filterPlatformsByQuery(
  platforms: FilterOption[],
  query: string
): FilterOption[] {
  if (!query.trim()) return [];
  
  const lowerSearch = query.toLowerCase();
  return platforms.filter((p) =>
    p.name.toLowerCase().includes(lowerSearch)
  );
}