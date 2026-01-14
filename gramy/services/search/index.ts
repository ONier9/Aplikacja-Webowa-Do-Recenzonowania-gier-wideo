import { searchRepository } from "./repository";
import {
  transformGameResults,
  transformFilterOptions,
  filterPlatformsByQuery,
  SearchResult,
  FilterOption,
  GameSearchResult,
} from "./helpers";

export type { GameSearchResult, FilterOption, SearchResult };

const DEFAULT_PAGE_SIZE = 20;

export async function getFilteredGames(
  platformIds: number[] | null,
  genreIds: number[] | null,
  companyIds: number[] | null,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<SearchResult> {
  try {
    const rawData = await searchRepository.fetchFilteredGames(
      platformIds,
      genreIds,
      companyIds,
      page,
      pageSize
    );
    return transformGameResults(rawData);
  } catch (error) {
    console.error("[getFilteredGames] Error:", error);
    throw error;
  }
}

export async function getAllGenres(): Promise<FilterOption[]> {
  try {
    const rawData = await searchRepository.fetchAllGenres();
    return transformFilterOptions(rawData);
  } catch (error) {
    console.error("[getAllGenres] Error:", error);
    return [];
  }
}

export async function getAllPlatforms(): Promise<FilterOption[]> {
  try {
    const rawData = await searchRepository.fetchAllPlatforms();
    return transformFilterOptions(rawData);
  } catch (error) {
    console.error("[getAllPlatforms] Error:", error);
    return [];
  }
}

export async function searchCompanies(query: string): Promise<FilterOption[]> {
  try {
    const rawData = await searchRepository.searchCompanies(query);
    return transformFilterOptions(rawData);
  } catch (error) {
    console.error("[searchCompanies] Error:", error);
    return [];
  }
}

export function filterPlatforms(
  platforms: FilterOption[],
  query: string
): FilterOption[] {
  return filterPlatformsByQuery(platforms, query);
}