

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."add_game_to_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
    if not exists (
        select 1
        from collections
        where id = p_collection_id
          and user_id = p_user_id
          and not is_system
    ) then
        raise exception 'Access denied or cannot modify system collection';
    end if;

    insert into collection_games (collection_id, game_id)
    values (p_collection_id, p_game_id)
    on conflict do nothing;
end;
$$;


ALTER FUNCTION "public"."add_game_to_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_game_log"("p_game_id" bigint, "p_log" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_log_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into game_logs (
    user_id,
    game_id,
    play_count,
    hours_played,
    platform_id,
    notes,
    completed,
    started_at,
    completed_at
  )
  values (
    v_user_id,
    p_game_id,
    coalesce((p_log->>'play_count')::int, 1),
    (p_log->>'hours_played')::numeric,
    (p_log->>'platform_id')::int,
    p_log->>'notes',
    coalesce((p_log->>'completed')::boolean, false),
    (p_log->>'started_at')::timestamptz,
    (p_log->>'completed_at')::timestamptz
  )
  returning id into v_log_id;

  if p_log ? 'rating' or p_log ? 'review_text' then
    insert into reviews (user_id, game_id, rating, content, updated_at)
    values (
      v_user_id,
      p_game_id,
      coalesce((p_log->>'rating')::int, 0),
      coalesce(p_log->>'review_text', ''),
      now()
    )
    on conflict (user_id, game_id)
    do update set
      rating = excluded.rating,
      content = excluded.content,
      updated_at = now();
  end if;

  return v_log_id;
end;
$$;


ALTER FUNCTION "public"."create_game_log"("p_game_id" bigint, "p_log" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_likes_count"("collection_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE collections 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = collection_id;
END;
$$;


ALTER FUNCTION "public"."decrement_likes_count"("collection_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_id"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 20) RETURNS TABLE("igdb_id" bigint, "name" "text", "summary" "text", "cover_url" "text", "release_date" "date", "screenshots" "jsonb", "total_count" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
    v_offset INT := (p_page - 1) * p_page_size;
BEGIN
    IF p_page < 1 OR p_page_size < 1 OR p_page_size > 100 THEN
        RAISE EXCEPTION 'Invalid pagination parameters: page must be >= 1, page_size must be between 1 and 100';
    END IF;

    CASE p_entity_type
        WHEN 'platform' THEN
            RETURN QUERY
            SELECT
                g.igdb_id,
                g.name,
                g.summary,
                g.cover_url,
                g.release_date,
                g.screenshots,
                COUNT(*) OVER() AS total_count
            FROM
                public.games g
            JOIN
                public.platform_games pg ON g.igdb_id = pg.game_id
            WHERE
                pg.platform_id = p_entity_id
            ORDER BY
                g.name ASC
            OFFSET v_offset
            LIMIT p_page_size;

        WHEN 'genre' THEN
            RETURN QUERY
            SELECT
                g.igdb_id,
                g.name,
                g.summary,
                g.cover_url,
                g.release_date,
                g.screenshots,
                COUNT(*) OVER() AS total_count
            FROM
                public.games g
            JOIN
                public.genre_games gg ON g.igdb_id = gg.game_id
            WHERE
                gg.genre_id = p_entity_id
            ORDER BY
                g.name ASC
            OFFSET v_offset
            LIMIT p_page_size;

        WHEN 'company' THEN
            RETURN QUERY
            SELECT
                g.igdb_id,
                g.name,
                g.summary,
                g.cover_url,
                g.release_date,
                g.screenshots,
                COUNT(*) OVER() AS total_count
            FROM
                public.games g
            JOIN
                public.company_games cg ON g.igdb_id = cg.game_id
            WHERE
                cg.company_id = p_entity_id
            ORDER BY
                g.name ASC
            OFFSET v_offset
            LIMIT p_page_size;

        ELSE
            RAISE EXCEPTION 'Invalid entity type: %', p_entity_type;
    END CASE;
END;
$$;


ALTER FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) RETURNS TABLE("igdb_id" bigint, "name" "text", "cover_url" "text", "total_count" bigint)
    LANGUAGE "plpgsql"
    AS $$DECLARE
  offset_value integer := (page_number - 1) * page_size;
BEGIN
  RETURN QUERY
  WITH filtered_games AS (
    SELECT 
      g.igdb_id, 
      g.name, 
      g.cover_url,
      COUNT(DISTINCT CASE WHEN in_platform_ids IS NOT NULL AND pg.platform_id = ANY(in_platform_ids) THEN pg.platform_id END) AS platform_matches,
      COUNT(DISTINCT CASE WHEN in_genre_ids IS NOT NULL AND gg.genre_id = ANY(in_genre_ids) THEN gg.genre_id END) AS genre_matches,
      COUNT(DISTINCT CASE WHEN in_company_ids IS NOT NULL AND cg.company_id = ANY(in_company_ids) THEN cg.company_id END) AS company_matches
    FROM games g
    LEFT JOIN platform_games pg ON g.igdb_id = pg.game_id
    LEFT JOIN genre_games gg ON g.igdb_id = gg.game_id
    LEFT JOIN company_games cg ON g.igdb_id = cg.game_id
    GROUP BY g.igdb_id, g.name, g.cover_url
    HAVING
      (in_platform_ids IS NULL OR COUNT(DISTINCT CASE WHEN pg.platform_id = ANY(in_platform_ids) THEN pg.platform_id END) = array_length(in_platform_ids, 1))
      AND
     (in_genre_ids IS NULL OR COUNT(DISTINCT CASE WHEN gg.genre_id = ANY(in_genre_ids) THEN gg.genre_id END) = array_length(in_genre_ids, 1))
      AND
    (in_company_ids IS NULL OR COUNT(DISTINCT CASE WHEN cg.company_id = ANY(in_company_ids) THEN cg.company_id END) = array_length(in_company_ids, 1))
  ),
  total AS (
    SELECT count(*) AS count FROM filtered_games
  )
  SELECT
    fg.igdb_id,
    fg.name,
    fg.cover_url,
    t.count AS total_count
  FROM filtered_games fg, total t
  ORDER BY fg.name
  OFFSET offset_value
  LIMIT page_size;
END;$$;


ALTER FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_follower_count"("user_id" "uuid") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(*)
  FROM public.follows
  WHERE following_id = user_id;
$$;


ALTER FUNCTION "public"."get_follower_count"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_following_count"("user_id" "uuid") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(*)
  FROM public.follows
  WHERE follower_id = user_id;
$$;


ALTER FUNCTION "public"."get_following_count"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) RETURNS TABLE("game_igdb_id" bigint, "game_name" "text", "game_summary" "text", "game_cover_url" "text", "game_background_art_url" "text", "game_release_date" "date", "game_screenshots" "jsonb", "game_created_at" timestamp without time zone, "genres" "jsonb", "platforms" "jsonb", "companies" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.igdb_id AS game_igdb_id,
        g.name AS game_name,
        g.summary AS game_summary,
        g.cover_url AS game_cover_url,
        g.background_art_url AS game_background_art_url,
        g.release_date::date AS game_release_date,
        g.screenshots AS game_screenshots,
        g.created_at::timestamp AS game_created_at,
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'igdb_id', ge.igdb_id,
                'name', ge.name
            ))
            FROM public.genre_games gg
            JOIN public.genres ge ON gg.genre_id = ge.igdb_id
            WHERE gg.game_id = g.igdb_id
        ), '[]'::jsonb) AS genres,
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'igdb_id', p.igdb_id,
                'name', p.name
            ))
            FROM public.platform_games pg
            JOIN public.platforms p ON pg.platform_id = p.igdb_id
            WHERE pg.game_id = g.igdb_id
        ), '[]'::jsonb) AS platforms,
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'igdb_id', c.igdb_id,
                'name', c.name
            ))
            FROM public.company_games cg
            JOIN public.companies c ON cg.company_id = c.igdb_id
            WHERE cg.game_id = g.igdb_id
        ), '[]'::jsonb) AS companies
    FROM
        public.games g
    WHERE
        g.igdb_id = p_igdb_id;
END;
$$;


ALTER FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer DEFAULT 1, "p_page_size" integer DEFAULT 3, "p_sort_by" "text" DEFAULT 'created_at'::"text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "game_id" bigint, "rating" numeric, "review_text" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "username" "text", "avatar_url" "text", "likes" bigint)
    LANGUAGE "plpgsql"
    AS $_$BEGIN
  RETURN QUERY EXECUTE format($f$
    SELECT 
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.review_text,
      r.created_at,
      r.updated_at,
      p.username,
      p.avatar_url,
      r.likes
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    WHERE r.game_id = $1
    ORDER BY %s DESC
    LIMIT $2 OFFSET $3
  $f$, 
    CASE 
      WHEN p_sort_by = 'likes' THEN 'r.likes'
      ELSE 'r.updated_at'
    END
  )
  USING p_game_id, p_page_size, (p_page - 1) * p_page_size;
END;$_$;


ALTER FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_mutual_followers_count"("user_a" "uuid", "user_b" "uuid") RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(*)
  FROM public.follows f1
  INNER JOIN public.follows f2 
    ON f1.following_id = f2.following_id
  WHERE f1.follower_id = user_a
    AND f2.follower_id = user_b
    AND f1.following_id != user_a
    AND f1.following_id != user_b;
$$;


ALTER FUNCTION "public"."get_mutual_followers_count"("user_a" "uuid", "user_b" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_username"("p_id" "uuid") RETURNS TABLE("username" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  RETURN QUERY
  SELECT p.username 
  FROM profiles p
  WHERE p.id = p_id; 
END;$$;


ALTER FUNCTION "public"."get_username"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nickname',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_likes_count"("collection_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE collections 
  SET likes_count = likes_count + 1 
  WHERE id = collection_id;
END;
$$;


ALTER FUNCTION "public"."increment_likes_count"("collection_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_following"("follower" "uuid", "following" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.follows
    WHERE follower_id = follower
      AND following_id = following
  );
$$;


ALTER FUNCTION "public"."is_following"("follower" "uuid", "following" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_banned"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COALESCE(banned, false)
  FROM profiles
  WHERE id = user_uuid;
$$;


ALTER FUNCTION "public"."is_user_banned"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_follower"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_new_follower"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_user_follow_stats"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_follow_stats;
END;
$$;


ALTER FUNCTION "public"."refresh_user_follow_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_game_from_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
    if not exists (
        select 1
        from collections
        where id = p_collection_id
          and user_id = p_user_id
          and not is_system
    ) then
        raise exception 'Access denied or cannot modify system collection';
    end if;

    delete from collection_games
    where collection_id = p_collection_id
      and game_id = p_game_id;
end;
$$;


ALTER FUNCTION "public"."remove_game_from_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_game_status"("p_user_id" "uuid", "p_game_id" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    v_collection_ids uuid[];
begin
    select array_agg(id) into v_collection_ids
    from collections
    where user_id = p_user_id
      and description = 'SYSTEM_STATUS_COLLECTION'
      and is_system = true;

    if v_collection_ids is not null then
        delete from collection_games
        where collection_id = any(v_collection_ids)
          and game_id = p_game_id;
    end if;

    delete from game_status
    where user_id = p_user_id
      and game_id = p_game_id;

end;
$$;


ALTER FUNCTION "public"."remove_game_status"("p_user_id" "uuid", "p_game_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_game_status"("p_user_id" "uuid", "p_game_id" integer, "p_status" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    v_collection_id uuid;
begin
    delete from collection_games
    where collection_id in (
        select id from collections
        where user_id = p_user_id
          and description = 'SYSTEM_STATUS_COLLECTION'
          and is_system = true
    )
    and game_id = p_game_id;

    select id into v_collection_id
    from collections
    where user_id = p_user_id
      and name = 
          case p_status
              when 'want_to_play' then 'Want to Play'
              when 'playing' then 'Currently Playing'
              when 'completed' then 'Completed'
              when 'dropped' then 'Dropped'
              when 'on_hold' then 'On Hold'
          end
      and description = 'SYSTEM_STATUS_COLLECTION'
      and is_system = true
    limit 1;

    if v_collection_id is null then
        insert into collections(user_id, name, description, is_public, is_system, created_at, updated_at)
        values (
            p_user_id,
            case p_status
                when 'want_to_play' then 'Want to Play'
                when 'playing' then 'Currently Playing'
                when 'completed' then 'Completed'
                when 'dropped' then 'Dropped'
                when 'on_hold' then 'On Hold'
            end,
            'SYSTEM_STATUS_COLLECTION',
            true,
            true,
            now(),
            now()
        )
        returning id into v_collection_id;
    end if;

    insert into collection_games(collection_id, game_id)
    values (v_collection_id, p_game_id)
    on conflict (collection_id, game_id) do nothing;

    insert into game_status(user_id, game_id, status, updated_at)
    values (p_user_id, p_game_id, p_status, now())
    on conflict (user_id, game_id) do update
        set status = excluded.status,
            updated_at = excluded.updated_at;

end;
$$;


ALTER FUNCTION "public"."set_game_status"("p_user_id" "uuid", "p_game_id" integer, "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
 IF (OLD.rating IS DISTINCT FROM NEW.rating) OR 
     (OLD.review_text IS DISTINCT FROM NEW.review_text) THEN
    NEW.updated_at = NOW();
    NEW.updated = true;
  END IF;
  
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_collection_game"("p_collection_id" "uuid", "p_game_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_exists boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from collections
    where id = p_collection_id
      and user_id = v_user_id
  ) then
    raise exception 'Access denied';
  end if;

  select exists (
    select 1
    from collection_games
    where collection_id = p_collection_id
      and game_id = p_game_id
  ) into v_exists;

  if v_exists then
    delete from collection_games
    where collection_id = p_collection_id
      and game_id = p_game_id;
  else
    insert into collection_games (collection_id, game_id)
    values (p_collection_id, p_game_id);
  end if;

  return not v_exists;
end;
$$;


ALTER FUNCTION "public"."toggle_collection_game"("p_collection_id" "uuid", "p_game_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_review_like"("p_review_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_count int;
  v_is_liked boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1
    from review_likes
    where review_id = p_review_id
      and user_id = v_user_id
  ) then
    delete from review_likes
    where review_id = p_review_id
      and user_id = v_user_id;
    v_is_liked := false; 
  else
    insert into review_likes (review_id, user_id)
    values (p_review_id, v_user_id);
    v_is_liked := true; 
  end if;

  select count(*)
  into v_count
  from review_likes
  where review_id = p_review_id;

  return json_build_object(
    'count', v_count,
    'is_liked', v_is_liked
  );
end;
$$;


ALTER FUNCTION "public"."toggle_review_like"("p_review_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_created_at_on_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_created_at_on_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews 
    SET likes = (
      SELECT COUNT(*) 
      FROM review_likes 
      WHERE review_id = NEW.review_id
    )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews 
    SET likes = (
      SELECT COUNT(*) 
      FROM review_likes 
      WHERE review_id = OLD.review_id
    )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_review_likes_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "performed_by" "uuid",
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


ALTER TABLE "public"."activity_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."activity_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."collection_games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collection_id" "uuid" NOT NULL,
    "game_id" bigint NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collection_games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_system" boolean DEFAULT false,
    CONSTRAINT "collections_description_check" CHECK (("length"("description") <= 500)),
    CONSTRAINT "collections_name_check" CHECK (("length"("name") <= 100))
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "igdb_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_games" (
    "company_id" bigint NOT NULL,
    "game_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."company_games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "following_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "follows_no_self_follow" CHECK (("follower_id" <> "following_id"))
);


ALTER TABLE "public"."follows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "game_id" bigint NOT NULL,
    "rating" numeric(2,1),
    "review_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "likes" bigint DEFAULT '0'::bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated" boolean DEFAULT false NOT NULL,
    "is_log_only" boolean DEFAULT false,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 0.5) AND ("rating" <= 5.0))),
    CONSTRAINT "reviews_review_text_check" CHECK (("length"("review_text") <= 500))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."game_average_scores" AS
 SELECT "game_id",
    "avg"("rating") AS "average_rating",
    "count"(*) AS "total_reviews"
   FROM "public"."reviews"
  GROUP BY "game_id";


ALTER VIEW "public"."game_average_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "game_id" bigint NOT NULL,
    "review_id" "uuid",
    "play_count" integer DEFAULT 1,
    "hours_played" numeric(10,2),
    "platform_id" bigint,
    "notes" "text",
    "completed" boolean DEFAULT false,
    "started_at" "date",
    "completed_at" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "game_logs_notes_check" CHECK (("length"("notes") <= 1000)),
    CONSTRAINT "game_logs_play_count_check" CHECK (("play_count" > 0))
);


ALTER TABLE "public"."game_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "game_id" bigint NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "game_status_status_check" CHECK (("status" = ANY (ARRAY['want_to_play'::"text", 'playing'::"text", 'completed'::"text", 'dropped'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."game_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "igdb_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "name" "text" NOT NULL,
    "summary" "text",
    "cover_url" "text",
    "background_art_url" "text",
    "release_date" "date",
    "screenshots" "jsonb"
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genre_games" (
    "genre_id" bigint NOT NULL,
    "game_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."genre_games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genres" (
    "igdb_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."genres" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_games" (
    "platform_id" bigint NOT NULL,
    "game_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."platform_games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platforms" (
    "igdb_id" bigint NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."platforms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "description" "text",
    "role" "text" DEFAULT 'user'::"text",
    "banned" boolean DEFAULT false,
    CONSTRAINT "profiles_description_check" CHECK (("length"("description") <= 500)),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "review_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_likes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_games" AS
 SELECT "g"."igdb_id",
    "g"."name",
    "g"."cover_url",
    "avg"("r"."rating") AS "avg_rating",
    "count"("r".*) FILTER (WHERE ("r"."created_at" > ("now"() - '30 days'::interval))) AS "recent_reviews",
    "max"("r"."created_at") AS "latest_review"
   FROM ("public"."games" "g"
     JOIN "public"."reviews" "r" ON (("g"."igdb_id" = "r"."game_id")))
  GROUP BY "g"."igdb_id", "g"."name", "g"."cover_url";


ALTER VIEW "public"."top_games" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."top_recent_reviews" AS
 SELECT DISTINCT ON ("r"."game_id") "r"."id" AS "review_id",
    "r"."review_text",
    "r"."rating",
    "r"."created_at",
    "r"."game_id",
    "r"."likes",
    "g"."name" AS "game_name",
    "g"."cover_url",
    "p"."username"
   FROM (("public"."reviews" "r"
     JOIN "public"."games" "g" ON (("r"."game_id" = "g"."igdb_id")))
     LEFT JOIN "public"."profiles" "p" ON (("r"."user_id" = "p"."id")))
  WHERE (("r"."review_text" IS NOT NULL) AND ("r"."created_at" > ("now"() - '30 days'::interval)))
  ORDER BY "r"."game_id", "r"."likes" DESC, "r"."created_at" DESC;


ALTER VIEW "public"."top_recent_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorite_games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "game_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_top_favorite" boolean DEFAULT false
);


ALTER TABLE "public"."user_favorite_games" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."user_follow_stats" AS
 SELECT "p"."id" AS "user_id",
    "p"."username",
    COALESCE("followers"."count", (0)::bigint) AS "follower_count",
    COALESCE("following"."count", (0)::bigint) AS "following_count"
   FROM (("public"."profiles" "p"
     LEFT JOIN ( SELECT "follows"."following_id",
            "count"(*) AS "count"
           FROM "public"."follows"
          GROUP BY "follows"."following_id") "followers" ON (("p"."id" = "followers"."following_id")))
     LEFT JOIN ( SELECT "follows"."follower_id",
            "count"(*) AS "count"
           FROM "public"."follows"
          GROUP BY "follows"."follower_id") "following" ON (("p"."id" = "following"."follower_id")))
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."user_follow_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_games"
    ADD CONSTRAINT "collection_games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collection_games"
    ADD CONSTRAINT "collection_games_unique" UNIQUE ("collection_id", "game_id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("igdb_id");



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_pkey" PRIMARY KEY ("company_id", "game_id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_unique_pair" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_status"
    ADD CONSTRAINT "game_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_status"
    ADD CONSTRAINT "game_status_unique" UNIQUE ("user_id", "game_id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("igdb_id");



ALTER TABLE ONLY "public"."genre_games"
    ADD CONSTRAINT "genre_games_pkey" PRIMARY KEY ("genre_id", "game_id");



ALTER TABLE ONLY "public"."genres"
    ADD CONSTRAINT "genres_pkey" PRIMARY KEY ("igdb_id");



ALTER TABLE ONLY "public"."platform_games"
    ADD CONSTRAINT "platform_games_pkey" PRIMARY KEY ("platform_id", "game_id");



ALTER TABLE ONLY "public"."platforms"
    ADD CONSTRAINT "platforms_pkey" PRIMARY KEY ("igdb_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_review_id_key" UNIQUE ("user_id", "review_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_game_id_key" UNIQUE ("user_id", "game_id");



ALTER TABLE ONLY "public"."user_favorite_games"
    ADD CONSTRAINT "unique_user_game" UNIQUE ("user_id", "game_id");



ALTER TABLE ONLY "public"."user_favorite_games"
    ADD CONSTRAINT "user_favorite_games_pkey" PRIMARY KEY ("id");



CREATE INDEX "company_games_company_id_idx" ON "public"."company_games" USING "btree" ("company_id");



CREATE INDEX "games_background_art_url_release_date_screenshots_idx" ON "public"."games" USING "btree" ("background_art_url", "release_date", "screenshots");



CREATE INDEX "games_cover_url_idx" ON "public"."games" USING "btree" ("cover_url");



CREATE INDEX "games_igdb_id_idx" ON "public"."games" USING "btree" ("igdb_id");



CREATE INDEX "genre_games_genre_id_idx" ON "public"."genre_games" USING "btree" ("genre_id");



CREATE INDEX "idx_collection_games_collection_id" ON "public"."collection_games" USING "btree" ("collection_id");



CREATE INDEX "idx_collection_games_game_id" ON "public"."collection_games" USING "btree" ("game_id");



CREATE INDEX "idx_collections_user_id" ON "public"."collections" USING "btree" ("user_id");



CREATE INDEX "idx_companies_name" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "idx_company_games_game" ON "public"."company_games" USING "btree" ("game_id");



CREATE INDEX "idx_follows_created_at" ON "public"."follows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_follows_follower_following" ON "public"."follows" USING "btree" ("follower_id", "following_id");



CREATE INDEX "idx_follows_follower_id" ON "public"."follows" USING "btree" ("follower_id");



CREATE INDEX "idx_follows_following_id" ON "public"."follows" USING "btree" ("following_id");



CREATE INDEX "idx_game_logs_game_id" ON "public"."game_logs" USING "btree" ("game_id");



CREATE INDEX "idx_game_logs_review_id" ON "public"."game_logs" USING "btree" ("review_id");



CREATE INDEX "idx_game_logs_user_id" ON "public"."game_logs" USING "btree" ("user_id");



CREATE INDEX "idx_game_status_game_id" ON "public"."game_status" USING "btree" ("game_id");



CREATE INDEX "idx_game_status_user_id" ON "public"."game_status" USING "btree" ("user_id");



CREATE INDEX "idx_games_has_background_art" ON "public"."games" USING "btree" ("background_art_url") WHERE ("background_art_url" IS NOT NULL);



CREATE INDEX "idx_games_name" ON "public"."games" USING "btree" ("name");



CREATE INDEX "idx_games_release_date" ON "public"."games" USING "btree" ("release_date");



CREATE INDEX "idx_genre_games_game" ON "public"."genre_games" USING "btree" ("game_id");



CREATE INDEX "idx_genres_name" ON "public"."genres" USING "btree" ("name");



CREATE INDEX "idx_platform_games_game" ON "public"."platform_games" USING "btree" ("game_id");



CREATE INDEX "idx_platforms_name" ON "public"."platforms" USING "btree" ("name");



CREATE UNIQUE INDEX "idx_user_follow_stats_user_id" ON "public"."user_follow_stats" USING "btree" ("user_id");



CREATE INDEX "platform_games_platform_id_idx" ON "public"."platform_games" USING "btree" ("platform_id");



CREATE INDEX "review_likes_review_id_idx" ON "public"."review_likes" USING "btree" ("review_id");



CREATE INDEX "review_likes_user_id_idx" ON "public"."review_likes" USING "btree" ("user_id");



CREATE INDEX "reviews_game_id_idx" ON "public"."reviews" USING "btree" ("game_id");



CREATE INDEX "reviews_user_id_idx" ON "public"."reviews" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_follow_created" AFTER INSERT ON "public"."follows" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_follower"();



CREATE OR REPLACE TRIGGER "review_likes_count_trigger" AFTER INSERT OR DELETE ON "public"."review_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_likes_count"();



CREATE OR REPLACE TRIGGER "set_updated_at_trigger" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_games"
    ADD CONSTRAINT "collection_games_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collection_games"
    ADD CONSTRAINT "collection_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follows"
    ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id");



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("igdb_id");



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."game_logs"
    ADD CONSTRAINT "game_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."game_status"
    ADD CONSTRAINT "game_status_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id");



ALTER TABLE ONLY "public"."game_status"
    ADD CONSTRAINT "game_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."genre_games"
    ADD CONSTRAINT "genre_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."genre_games"
    ADD CONSTRAINT "genre_games_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_games"
    ADD CONSTRAINT "platform_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_games"
    ADD CONSTRAINT "platform_games_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_profiles_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorite_games"
    ADD CONSTRAINT "user_favorite_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id");



ALTER TABLE ONLY "public"."user_favorite_games"
    ADD CONSTRAINT "user_favorite_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Admins can update profiles" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text") AND ("profiles_1"."banned" = false)))));



CREATE POLICY "All users can read reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Anyone can read profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view follows" ON "public"."follows" FOR SELECT USING (true);



CREATE POLICY "Anyone can view games in public collections" ON "public"."collection_games" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."collections"
  WHERE (("collections"."id" = "collection_games"."collection_id") AND ("collections"."is_public" = true)))));



CREATE POLICY "Anyone can view public collections" ON "public"."collections" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Authenticated users can follow others" ON "public"."follows" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("auth"."uid"() = "follower_id") AND ("auth"."uid"() <> "following_id")));



CREATE POLICY "Banned users cannot create collections" ON "public"."collections" FOR INSERT WITH CHECK ((NOT "public"."is_user_banned"("auth"."uid"())));



CREATE POLICY "Banned users cannot create reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((NOT "public"."is_user_banned"("auth"."uid"())));



CREATE POLICY "Banned users cannot follow" ON "public"."follows" FOR INSERT WITH CHECK ((NOT "public"."is_user_banned"("auth"."uid"())));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."activity_logs" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."review_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_favorite_games" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_favorite_games" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."activity_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."genre_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."genres" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."platform_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."platforms" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."review_likes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_favorite_games" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on user_id" ON "public"."user_favorite_games" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can add games to own collections" ON "public"."collection_games" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."collections"
  WHERE (("collections"."id" = "collection_games"."collection_id") AND ("collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create own collections" ON "public"."collections" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create own game logs" ON "public"."game_logs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create own game status" ON "public"."game_status" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own collections" ON "public"."collections" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own game logs" ON "public"."game_logs" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own game status" ON "public"."game_status" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their reviews" ON "public"."reviews" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their reviews" ON "public"."reviews" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own game status" ON "public"."game_status" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove games from own collections" ON "public"."collection_games" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."collections"
  WHERE (("collections"."id" = "collection_games"."collection_id") AND ("collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can unfollow" ON "public"."follows" FOR DELETE USING (("auth"."uid"() = "follower_id"));



CREATE POLICY "Users can update own collections" ON "public"."collections" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own game logs" ON "public"."game_logs" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own game status" ON "public"."game_status" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their reviews" ON "public"."reviews" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view all game logs" ON "public"."game_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view all game statuses" ON "public"."game_status" FOR SELECT USING (true);



CREATE POLICY "Users can view games in own collections" ON "public"."collection_games" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."collections"
  WHERE (("collections"."id" = "collection_games"."collection_id") AND ("collections"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own collections" ON "public"."collections" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own game status" ON "public"."game_status" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collection_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."genre_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."genres" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platforms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorite_games" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_game_to_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_game_to_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_game_to_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_game_log"("p_game_id" bigint, "p_log" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_game_log"("p_game_id" bigint, "p_log" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_game_log"("p_game_id" bigint, "p_log" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_likes_count"("collection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_likes_count"("collection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_likes_count"("collection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_follower_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_follower_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_follower_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_following_count"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_following_count"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_following_count"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_mutual_followers_count"("user_a" "uuid", "user_b" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_mutual_followers_count"("user_a" "uuid", "user_b" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_mutual_followers_count"("user_a" "uuid", "user_b" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_username"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_username"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_username"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_likes_count"("collection_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_likes_count"("collection_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_likes_count"("collection_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_following"("follower" "uuid", "following" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_following"("follower" "uuid", "following" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_following"("follower" "uuid", "following" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_banned"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_banned"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_banned"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_follower"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_follower"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_follower"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_user_follow_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_user_follow_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_user_follow_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_game_from_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_game_from_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_game_from_collection"("p_collection_id" "uuid", "p_game_id" integer, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_game_status"("p_user_id" "uuid", "p_game_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_game_status"("p_user_id" "uuid", "p_game_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_game_status"("p_user_id" "uuid", "p_game_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_game_status"("p_user_id" "uuid", "p_game_id" integer, "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_game_status"("p_user_id" "uuid", "p_game_id" integer, "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_game_status"("p_user_id" "uuid", "p_game_id" integer, "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_collection_game"("p_collection_id" "uuid", "p_game_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_collection_game"("p_collection_id" "uuid", "p_game_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_collection_game"("p_collection_id" "uuid", "p_game_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_created_at_on_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_created_at_on_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_created_at_on_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."collection_games" TO "anon";
GRANT ALL ON TABLE "public"."collection_games" TO "authenticated";
GRANT ALL ON TABLE "public"."collection_games" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_games" TO "anon";
GRANT ALL ON TABLE "public"."company_games" TO "authenticated";
GRANT ALL ON TABLE "public"."company_games" TO "service_role";



GRANT ALL ON TABLE "public"."follows" TO "anon";
GRANT ALL ON TABLE "public"."follows" TO "authenticated";
GRANT ALL ON TABLE "public"."follows" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."game_average_scores" TO "anon";
GRANT ALL ON TABLE "public"."game_average_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."game_average_scores" TO "service_role";



GRANT ALL ON TABLE "public"."game_logs" TO "anon";
GRANT ALL ON TABLE "public"."game_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."game_logs" TO "service_role";



GRANT ALL ON TABLE "public"."game_status" TO "anon";
GRANT ALL ON TABLE "public"."game_status" TO "authenticated";
GRANT ALL ON TABLE "public"."game_status" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."genre_games" TO "anon";
GRANT ALL ON TABLE "public"."genre_games" TO "authenticated";
GRANT ALL ON TABLE "public"."genre_games" TO "service_role";



GRANT ALL ON TABLE "public"."genres" TO "anon";
GRANT ALL ON TABLE "public"."genres" TO "authenticated";
GRANT ALL ON TABLE "public"."genres" TO "service_role";



GRANT ALL ON TABLE "public"."platform_games" TO "anon";
GRANT ALL ON TABLE "public"."platform_games" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_games" TO "service_role";



GRANT ALL ON TABLE "public"."platforms" TO "anon";
GRANT ALL ON TABLE "public"."platforms" TO "authenticated";
GRANT ALL ON TABLE "public"."platforms" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."review_likes" TO "anon";
GRANT ALL ON TABLE "public"."review_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."review_likes" TO "service_role";



GRANT ALL ON TABLE "public"."top_games" TO "anon";
GRANT ALL ON TABLE "public"."top_games" TO "authenticated";
GRANT ALL ON TABLE "public"."top_games" TO "service_role";



GRANT ALL ON TABLE "public"."top_recent_reviews" TO "anon";
GRANT ALL ON TABLE "public"."top_recent_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."top_recent_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorite_games" TO "anon";
GRANT ALL ON TABLE "public"."user_favorite_games" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorite_games" TO "service_role";



GRANT ALL ON TABLE "public"."user_follow_stats" TO "anon";
GRANT ALL ON TABLE "public"."user_follow_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."user_follow_stats" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
