import { supabase } from "./supabaseClient";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./constants";
import type { PaginatedResult } from "@/types";

export async function paginateQuery<T>(
  table: string,
  query: {
    select?: string;
    where?: { column: string; operator: string; value: any }[];
    order?: { column: string; ascending: boolean };
    textSearch?: { column: string; query: string };
  },
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<T>> {
  page = Math.max(1, page);
  pageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let queryBuilder = supabase
    .from(table)
    .select(query.select || "*", { count: "exact" });

  if (query.where?.length) {
    queryBuilder = query.where.reduce((qb, condition) => {
      return condition.operator === "in" && Array.isArray(condition.value)
        ? qb.in(condition.column, condition.value)
        : qb.filter(condition.column, condition.operator, condition.value);
    }, queryBuilder);
  }

  if (query.textSearch) {
    queryBuilder = queryBuilder.textSearch(
      query.textSearch.column,
      query.textSearch.query
    );
  }

  if (query.order) {
    queryBuilder = queryBuilder.order(query.order.column, {
      ascending: query.order.ascending,
    });
  }

  const { data, count, error } = await queryBuilder.range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: (data as T[]) ?? [],
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
  };
}
