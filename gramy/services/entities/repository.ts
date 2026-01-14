import { supabase } from "../supabaseClient";
import { GENRE_ENTITY_FIELDS, OTHER_ENTITY_FIELDS } from "../constants";
import { EntityType, RpcGameResult } from "@/types/services/services";

export const entityRepository = {
async fetchCompany(id: number) {
    const { data, error } = await supabase
      .from("companies")
      .select(OTHER_ENTITY_FIELDS)
      .eq("igdb_id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async fetchGenre(id: number) {
    const { data, error } = await supabase
      .from("genres")
      .select(GENRE_ENTITY_FIELDS)
      .eq("igdb_id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async fetchPlatform(id: number) {
    const { data, error } = await supabase
      .from("platforms")
      .select(OTHER_ENTITY_FIELDS)
      .eq("igdb_id", id)
      .single();

    if (error) throw error;
    return data;
  },


  async fetchEntityGames(
    entityType: EntityType,
    entityId: number,
    page: number,
    pageSize: number
  ): Promise<RpcGameResult[]> {
    const { data, error } = await supabase.rpc("get_entity_games_paginated", {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_page: page,
      p_page_size: pageSize,
    });

    if (error) throw error;
    return data || [];
  },
};