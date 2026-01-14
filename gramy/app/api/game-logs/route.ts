import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { collectionsService } from '@/services/collectionsService';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      gameId,
      playCount,
      hoursPlayed,
      platformId,
      notes,
      completed,
      startedAt,
      completedAt,
    } = body;
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    
    const log = await collectionsService.createGameLog(user.id, gameId, {
      play_count: playCount,
      hours_played: hoursPlayed,
      platform_id: platformId,
      notes,
      completed,
      started_at: startedAt,
      completed_at: completedAt,
    });
    
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('[Game Logs API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const gameId = searchParams.get('gameId');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (gameId) {
      const logs = await collectionsService.getGameLogs(user.id, parseInt(gameId));
      return NextResponse.json({ logs });
    } else {
      const logs = await collectionsService.getUserGameLogs(user.id, limit);
      return NextResponse.json({ logs });
    }
  } catch (error: any) {
    console.error('[Game Logs API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}