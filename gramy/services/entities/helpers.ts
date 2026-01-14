import { Game, PaginatedResult } from "@/types/";
import { RpcGameResult } from "@/types/services/services";

export function transformGame(game: RpcGameResult): Game {
  return {
    igdb_id: game.igdb_id,
    name: game.name,
    summary: game.summary || null,
    cover_url: game.cover_url || null,
    release_date: game.release_date ? new Date(game.release_date) : null,
    screenshots: game.screenshots || null,
    background_art_url: game.background_art_url || null,
    created_at: new Date(),
  };
}

export function transformGames(games: RpcGameResult[]): Game[] {
  return games.map(transformGame);
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

export function emptyPaginatedResult<T>(
  page: number = 1,
  pageSize: number = 25
): PaginatedResult<T> {
  return {
    data: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
    hasNextPage: false,
  };
}