'use server'

import { supabase } from "@/services/supabaseClient";
import type { 
  FilterOption, 
  GameSearchResult, 
  GameSuggestion,
  ActionResult,
  PaginatedActionResult 
} from "@/types/game.types";

export async function getFilteredGamesAction(
  platformIds: number[] | null,
  genreIds: number[] | null,
  companyIds: number[] | null,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedActionResult<GameSearchResult>> {
  try {
    const { data, error } = await supabase.rpc("get_filtered_games", {
      in_platform_ids: platformIds,
      in_genre_ids: genreIds,
      in_company_ids: companyIds,
      page_number: page,
      page_size: pageSize,
    });

    if (error) throw error;

    const games: GameSearchResult[] =
      data?.map((item: any) => ({
        igdb_id: item.igdb_id,
        name: item.name,
        cover_url: item.cover_url,
      })) || [];

    const totalCount = data?.[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: games,
      total_count: totalCount,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching filtered games:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch games",
      data: [],
      total_count: 0,
    };
  }
}

export async function getAllGenresAction(): Promise<ActionResult<FilterOption[]>> {
  try {
    const { data, error } = await supabase
      .from("genres")
      .select("igdb_id, name")
      .order("name", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error fetching genres:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch genres",
      data: [],
    };
  }
}

export async function getAllPlatformsAction(): Promise<ActionResult<FilterOption[]>> {
  try {
    const { data, error } = await supabase
      .from("platforms")
      .select("igdb_id, name")
      .order("name", { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch platforms",
      data: [],
    };
  }
}

export async function searchCompaniesAction(
  query: string
): Promise<ActionResult<FilterOption[]>> {
  if (!query.trim()) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("igdb_id, name")
      .ilike("name", `%${query}%`)
      .limit(5);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error searching companies:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search companies",
      data: [],
    };
  }
}

export async function searchPlatformsAction(
  query: string
): Promise<ActionResult<FilterOption[]>> {
  if (!query.trim()) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from("platforms")
      .select("igdb_id, name")
      .ilike("name", `%${query}%`)
      .limit(5);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error searching platforms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search platforms",
      data: [],
    };
  }
}

export async function getGameSuggestions(
  searchQuery: string,
  limit: number = 5
): Promise<ActionResult<GameSuggestion[]>> {
  if (!searchQuery.trim()) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from("games")
      .select("name, igdb_id")
      .ilike("name", `%${searchQuery}%`)
      .limit(limit);

    if (error) throw error;

    const suggestions: GameSuggestion[] =
      data?.map((item) => ({
        name: item.name,
        igdb_id: item.igdb_id,
      })) || [];

    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    console.error("Error getting game suggestions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get suggestions",
      data: [],
    };
  }
}