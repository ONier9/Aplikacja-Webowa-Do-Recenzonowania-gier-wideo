import { Game, PaginatedResult } from "@/types/";
import { Company, Genre, Platform } from "@/types/";
import { DEFAULT_PAGE_SIZE } from "@/services/constants";
type Entity = Company | Genre | Platform;

interface FetchEntityPageParams<T extends Entity> {
  id: string;
  searchParams?: { page?: string };
  entityFetcher: (id: number) => Promise<T | null>;
  gamesFetcher: (id: number, page: number, pageSize: number) => Promise<PaginatedResult<Game>>;
  pageSize?: number;
}

interface FetchEntityPageResult<T extends Entity> {
  entity: T | null;
  games: Game[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
  } | null;
  notFound: boolean;
}

export async function fetchEntityPage<T extends Entity>({
  id,
  searchParams,
  entityFetcher,
  gamesFetcher,
  pageSize = DEFAULT_PAGE_SIZE,
}: FetchEntityPageParams<T>): Promise<FetchEntityPageResult<T>> {
  const numericId = parseInt(id);
  if (isNaN(numericId)) {
    return {
      entity: null,
      games: [],
      pagination: null,
      notFound: true,
    };
  }

  const page = searchParams?.page ? parseInt(searchParams.page) : 1;

  try {
    const [entity, gamesResult] = await Promise.all([
      entityFetcher(numericId),
      gamesFetcher(numericId, page, pageSize),
    ]);

    if (!entity) {
      return {
        entity: null,
        games: [],
        pagination: null,
        notFound: true,
      };
    }

    return {
      entity,
      games: gamesResult.data,
      pagination: {
        page: gamesResult.page,
        totalPages: gamesResult.totalPages,
        total: gamesResult.total,
        pageSize: gamesResult.pageSize,
      },
      notFound: false,
    };
  } catch (error) {
    console.error(`[fetchEntityPage] Error fetching entity ${id}:`, error);
    return {
      entity: null,
      games: [],
      pagination: null,
      notFound: true,
    };
  }
}