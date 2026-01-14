import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GAMES_PER_REQUEST = 500;
const TOTAL_GAMES_TO_FETCH = 20000;
const REQUEST_DELAY_MS = 1000;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function getIGDBToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error(`Failed to get IGDB token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function fetchIGDBData(endpoint, body, token) {
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': IGDB_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`IGDB ${endpoint} error:`, res.status, text);
    return [];
  }
  return res.json();
}

async function upsertTable(table, records, key) {
  if (!records.length) return;
  const { error } = await supabase.from(table).upsert(records, { onConflict: key });
  if (error) console.error(`Error upserting ${table}:`, error.message);
}

function igdbImageUrl(image_id, size = '1080p') {
  return image_id
    ? `https://images.igdb.com/igdb/image/upload/t_${size}/${image_id}.jpg`
    : null;
}

async function seed() {
  const token = await getIGDBToken();
  let offset = 0;
  let totalFetched = 0;

  while (totalFetched < TOTAL_GAMES_TO_FETCH) {
    const body = `
      fields
        id,
        name,
        summary,
        cover.image_id,
        first_release_date,
        genres.id,
        genres.name,
        platforms.id,
        platforms.name,
        platforms.summary,
        involved_companies.company.id,
        involved_companies.company.name,
        involved_companies.company.description,
        screenshots.image_id,
        artworks.image_id;
      sort total_rating desc;
      limit ${GAMES_PER_REQUEST};
      offset ${offset};
    `;

    const games = await fetchIGDBData('games', body, token);
    if (!games.length) break;

    const genreSet = new Set();
    const platformSet = new Set();
    const companySet = new Set();

    games.forEach(game => {
      game.genres?.forEach(g => genreSet.add(JSON.stringify({ igdb_id: g.id, name: g.name })));
      game.platforms?.forEach(p =>
        platformSet.add(JSON.stringify({ igdb_id: p.id, name: p.name, description: p.summary || null }))
      );
      game.involved_companies?.forEach(ic =>
        companySet.add(JSON.stringify({ igdb_id: ic.company.id, name: ic.company.name, description: ic.company.description || null }))
      );
    });

    const genreRecords = Array.from(genreSet).map(JSON.parse);
    const platformRecords = Array.from(platformSet).map(JSON.parse);
    const companyRecords = Array.from(companySet).map(JSON.parse);

    await Promise.all([
      upsertTable('genres', genreRecords, 'igdb_id'),
      upsertTable('platforms', platformRecords, 'igdb_id'),
      upsertTable('companies', companyRecords, 'igdb_id'),
    ]);

    const allGenreGames = [];
    const allPlatformGames = [];
    const allCompanyGames = [];

    for (const game of games) {
      const gameRow = {
        igdb_id: game.id,
        name: game.name,
        summary: game.summary || null,
        cover_url: igdbImageUrl(game.cover?.image_id, 'cover_big'),
        background_art_url: igdbImageUrl(game.artworks?.[0]?.image_id, 'screenshot_huge'),
        screenshots: game.screenshots?.map(s => igdbImageUrl(s.image_id, 'screenshot_big')) || [],
        release_date: game.first_release_date
          ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
          : null,
      };

      await upsertTable('games', [gameRow], 'igdb_id');

      game.genres?.forEach(g => allGenreGames.push({ genre_id: g.id, game_id: game.id }));
      game.platforms?.forEach(p => allPlatformGames.push({ platform_id: p.id, game_id: game.id }));
      game.involved_companies?.forEach(ic => allCompanyGames.push({ company_id: ic.company.id, game_id: game.id }));
    }

    const uniqueGenreGames = Array.from(new Map(allGenreGames.map(r => [`${r.genre_id}_${r.game_id}`, r])).values());
    const uniquePlatformGames = Array.from(new Map(allPlatformGames.map(r => [`${r.platform_id}_${r.game_id}`, r])).values());
    const uniqueCompanyGames = Array.from(new Map(allCompanyGames.map(r => [`${r.company_id}_${r.game_id}`, r])).values());

    await Promise.all([
      upsertTable('genre_games', uniqueGenreGames, ['genre_id', 'game_id']),
      upsertTable('platform_games', uniquePlatformGames, ['platform_id', 'game_id']),
      upsertTable('company_games', uniqueCompanyGames, ['company_id', 'game_id']),
    ]);

    totalFetched += games.length;
    offset += GAMES_PER_REQUEST;
    if (totalFetched < TOTAL_GAMES_TO_FETCH) await delay(REQUEST_DELAY_MS);
  }
}

seed().catch(console.error);
