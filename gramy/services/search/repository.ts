import { supabase } from "../supabaseClient";

export type RawGameSearchResult = {
  igdb_id: number;
  name: string;
  cover_url: string | null;
  total_count?: number;
};

export type RawFilterOption = {
  igdb_id: number;
  name: string;
};

export const searchRepository = {
  async fetchFilteredGames(
    platformIds: number[] | null,
    genreIds: number[] | null,
    companyIds: number[] | null,
    page: number,
    pageSize: number
  ): Promise<RawGameSearchResult[]> {
    const { data, error } = await supabase.rpc("get_filtered_games", {
      in_platform_ids: platformIds,
      in_genre_ids: genreIds,
      in_company_ids: companyIds,
      page_number: page,
      page_size: pageSize,
    });

    if (error) throw error;
    return data || [];
  },

  async fetchAllGenres(): Promise<RawFilterOption[]> {
    const { data, error } = await supabase
      .from("genres")
      .select("igdb_id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async fetchAllPlatforms(): Promise<RawFilterOption[]> {
    const { data, error } = await supabase
      .from("platforms")
      .select("igdb_id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async searchCompanies(query: string, limit: number = 5): Promise<RawFilterOption[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("companies")
      .select("igdb_id, name")
      .ilike("name", `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};