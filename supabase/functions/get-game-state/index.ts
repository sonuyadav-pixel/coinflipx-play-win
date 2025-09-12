import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('get-game-state function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the active game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return new Response(JSON.stringify({ error: 'No active session found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const phaseEndsAt = new Date(session.phase_ends_at);
    const timeLeft = Math.max(0, Math.floor((phaseEndsAt.getTime() - now.getTime()) / 1000));

    let roundData = null;
    let roundResult = null;

    // Get current round data if exists
    if (session.current_round_id) {
      const { data: round, error: roundError } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', session.current_round_id)
        .single();

      if (!roundError && round) {
        roundData = round;
        roundResult = round.result;
      }
    }

    // Get the latest completed round for result display
    if (!roundResult && session.phase === 'result') {
      const { data: latestRound } = await supabase
        .from('rounds')
        .select('result')
        .not('result', 'is', null)
        .order('ended_at', { ascending: false })
        .limit(1)
        .single();

      if (latestRound) {
        roundResult = latestRound.result;
      }
    }

    console.log('Game state:', {
      phase: session.phase,
      timeLeft,
      roundId: session.current_round_id,
      result: roundResult
    });

    return new Response(JSON.stringify({ 
      success: true,
      gameState: {
        phase: session.phase,
        timeLeft,
        currentRoundId: session.current_round_id,
        result: roundResult,
        phaseStartedAt: session.phase_started_at,
        phaseEndsAt: session.phase_ends_at
      },
      session: session,
      round: roundData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-game-state:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});