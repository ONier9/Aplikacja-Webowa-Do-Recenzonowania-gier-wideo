import { Company, Genre, Platform, Game, PaginatedResult } from "@/types/";
import { EntityType } from "@/types/services/services";
import { DEFAULT_PAGE_SIZE } from "../constants";
import { entityRepository } from "./repository";
import { transformGames, buildPaginatedResult, emptyPaginatedResult } from "./helpers";

export async function getCompanyById(id: number): Promise<Company | null> {
  try {
    return await entityRepository.fetchCompany(id);
  } catch (error) {
    console.error(`[getCompanyById] Error fetching company ${id}:`, error);
    return null;
  }
}

export async function getGamesByCompany(
  companyId: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  return getEntityGames("company", companyId, page, pageSize);
}

export async function getGenreById(id: number): Promise<Genre | null> {
  try {
    return await entityRepository.fetchGenre(id);
  } catch (error) {
    console.error(`[getGenreById] Error fetching genre ${id}:`, error);
    return null;
  }
}

export async function getGamesByGenre(
  genreId: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  return getEntityGames("genre", genreId, page, pageSize);
}

export async function getPlatformById(id: number): Promise<Platform | null> {
  try {
    return await entityRepository.fetchPlatform(id);
  } catch (error) {
    console.error(`[getPlatformById] Error fetching platform ${id}:`, error);
    return null;
  }
}

export async function getGamesByPlatform(
  platformId: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  return getEntityGames("platform", platformId, page, pageSize);
}

export async function getEntityGames(
  entityType: EntityType,
  entityId: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Game>> {
  try {
    const rawGames = await entityRepository.fetchEntityGames(
      entityType,
      entityId,
      page,
      pageSize
    );

    if (!rawGames || rawGames.length === 0) {
      return emptyPaginatedResult(page, pageSize);
    }

    const total = rawGames[0].total_count;
    const games = transformGames(rawGames);

    return buildPaginatedResult(games, total, page, pageSize);
  } catch (error) {
    console.error(
      `[getEntityGames] Error fetching ${entityType} games for ${entityId}:`,
      error
    );
    return emptyPaginatedResult(page, pageSize);
  }
}