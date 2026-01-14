
import { supabase } from "./supabaseClient";
import { DEFAULT_PAGE_SIZE, GAME_FIELDS } from "./constants";
import { paginateQuery } from "./paginationService";
import type {
  Game,
  GameDetails,
  PaginatedResult,
  RpcGameDetailsResult,
} from "@/types";

export async function getGameById(id: string): Promise<Game | null> {
  const { data } = await supabase
    .from("games")
    .select(GAME_FIELDS)
    .eq("igdb_id", Number(id))
    .single();

  return data;
}

export async function getGameDetails(id: string): Promise<GameDetails> {
  const numericId = Number(id);
  const { data: rawData, error } = await supabase
    .rpc("get_game_details_by_id", { p_igdb_id: numericId })
    .single();

  if (!rawData) {
    return { game: null, genres: [], platforms: [], companies: [] };
  }

  const data = rawData as RpcGameDetailsResult;

  const game: Game = {
    igdb_id: data.game_igdb_id,
    name: data.game_name,
    summary: data.game_summary,
    cover_url: data.game_cover_url,
    release_date: data.game_release_date
      ? new Date(data.game_release_date)
      : null,
    screenshots: data.game_screenshots,
    background_art_url: data.game_background_art_url,
    created_at: new Date(data.game_created_at),
  };

  return {
    game,
    genres: data.genres || [],
    platforms: data.platforms || [],
    companies: data.companies || [],
  };
}

export async function getGames(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  return paginateQuery<Game>(
    "games",
    {
      select: GAME_FIELDS,
      order: { column: "name", ascending: true },
    },
    page,
    pageSize
  );
}

export async function searchGames(
  query: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  return paginateQuery<Game>(
    "games",
    {
      select: GAME_FIELDS,
      textSearch: { column: "name", query },
      order: { column: "name", ascending: true },
    },
    page,
    pageSize
  );
}