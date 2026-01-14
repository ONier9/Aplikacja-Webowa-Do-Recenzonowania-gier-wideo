

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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


CREATE OR REPLACE FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[] DEFAULT NULL::bigint[], "in_genre_ids" bigint[] DEFAULT NULL::bigint[], "in_company_ids" bigint[] DEFAULT NULL::bigint[], "page_number" integer DEFAULT 1, "page_size" integer DEFAULT 20) RETURNS TABLE("igdb_id" bigint, "cover_url" "text", "name" "text", "total_count" bigint)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    WITH filtered_games AS (
        SELECT 
            g.igdb_id,
            g.cover_url,
            g.name,
            COUNT(*) OVER() AS total_count
        FROM public.games g
        WHERE 
            (in_platform_ids IS NULL OR g.igdb_id IN (
                SELECT pg.game_id
                FROM public.platform_games pg
                WHERE pg.platform_id = ANY(in_platform_ids)
                GROUP BY pg.game_id
                HAVING COUNT(DISTINCT pg.platform_id) = cardinality(in_platform_ids)
            ))
            AND
            (in_genre_ids IS NULL OR g.igdb_id IN (
                SELECT gg.game_id
                FROM public.genre_games gg
                WHERE gg.genre_id = ANY(in_genre_ids)
                GROUP BY gg.game_id
                HAVING COUNT(DISTINCT gg.genre_id) = cardinality(in_genre_ids)
            ))
            AND
            (in_company_ids IS NULL OR g.igdb_id IN (
                SELECT cg.game_id
                FROM public.company_games cg
                WHERE cg.company_id = ANY(in_company_ids)
                GROUP BY cg.game_id
                HAVING COUNT(DISTINCT cg.company_id) = cardinality(in_company_ids)
            ))
        ORDER BY g.release_date DESC NULLS LAST
        LIMIT page_size
        OFFSET (page_number - 1) * page_size
    )
    SELECT 
        filtered_games.igdb_id,
        filtered_games.cover_url,
        filtered_games.name,
        filtered_games.total_count
    FROM filtered_games;
END;
$$;


ALTER FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) OWNER TO "postgres";


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
    AS $_$
BEGIN
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
      ELSE 'r.created_at'
    END
  )
  USING p_game_id, p_page_size, (p_page - 1) * p_page_size;
END;
$_$;


ALTER FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'nickname');
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET likes = likes + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET likes = likes - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_review_likes_count"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


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
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "review_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."review_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "game_id" bigint NOT NULL,
    "rating" numeric(2,1),
    "review_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "likes" bigint DEFAULT '0'::bigint NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 0.5) AND ("rating" <= 5.0))),
    CONSTRAINT "reviews_review_text_check" CHECK (("length"("review_text") <= 500))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("igdb_id");



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_pkey" PRIMARY KEY ("company_id", "game_id");



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



CREATE INDEX "idx_companies_name" ON "public"."companies" USING "btree" ("name");



CREATE INDEX "idx_company_games_game" ON "public"."company_games" USING "btree" ("game_id");



CREATE INDEX "idx_games_has_background_art" ON "public"."games" USING "btree" ("background_art_url") WHERE ("background_art_url" IS NOT NULL);



CREATE INDEX "idx_games_name" ON "public"."games" USING "btree" ("name");



CREATE INDEX "idx_games_release_date" ON "public"."games" USING "btree" ("release_date");



CREATE INDEX "idx_genre_games_game" ON "public"."genre_games" USING "btree" ("game_id");



CREATE INDEX "idx_genres_name" ON "public"."genres" USING "btree" ("name");



CREATE INDEX "idx_platform_games_game" ON "public"."platform_games" USING "btree" ("game_id");



CREATE INDEX "idx_platforms_name" ON "public"."platforms" USING "btree" ("name");



CREATE OR REPLACE TRIGGER "trg_update_review_likes_count" AFTER INSERT OR DELETE ON "public"."review_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_likes_count"();



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("igdb_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_games"
    ADD CONSTRAINT "company_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("igdb_id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_profiles_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."genre_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."genres" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."platform_games" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."platforms" FOR SELECT USING (true);



CREATE POLICY "Users can create their own reviews" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."genre_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."genres" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platforms" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_entity_games_paginated"("p_entity_type" "text", "p_entity_id" bigint, "p_page" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_filtered_games"("in_platform_ids" bigint[], "in_genre_ids" bigint[], "in_company_ids" bigint[], "page_number" integer, "page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_game_details_by_id"("p_igdb_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_game_reviews"("p_game_id" bigint, "p_page" integer, "p_page_size" integer, "p_sort_by" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "service_role";


















GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_games" TO "anon";
GRANT ALL ON TABLE "public"."company_games" TO "authenticated";
GRANT ALL ON TABLE "public"."company_games" TO "service_role";



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



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";









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
