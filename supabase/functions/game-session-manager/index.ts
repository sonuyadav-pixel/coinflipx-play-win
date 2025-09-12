import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('game-session-manager function called');
  
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
    const shouldProgress = now >= phaseEndsAt;

    console.log('Session check:', {
      currentPhase: session.phase,
      phaseEndsAt: session.phase_ends_at,
      now: now.toISOString(),
      shouldProgress
    });

    if (shouldProgress) {
      await progressGamePhase(supabase, session);
      
      // Fetch updated session
      const { data: updatedSession } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('is_active', true)
        .single();
        
      return new Response(JSON.stringify({ 
        success: true, 
        session: updatedSession,
        progressed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      session: session,
      progressed: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in game-session-manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function progressGamePhase(supabase: any, session: any) {
  const now = new Date();
  let nextPhase: string;
  let nextPhaseEndsAt: Date;
  let updateData: any = {
    phase_started_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  console.log('Progressing from phase:', session.phase);

  switch (session.phase) {
    case 'betting':
      // Move to flipping phase
      nextPhase = 'flipping';
      nextPhaseEndsAt = new Date(now.getTime() + (session.flipping_duration_seconds * 1000));
      updateData.phase = nextPhase;
      updateData.phase_ends_at = nextPhaseEndsAt.toISOString();
      
      console.log('Moving to flipping phase');
      break;

    case 'flipping':
      // Generate result and move to result phase
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      nextPhase = 'result';
      nextPhaseEndsAt = new Date(now.getTime() + (session.result_duration_seconds * 1000));
      
      updateData.phase = nextPhase;
      updateData.phase_ends_at = nextPhaseEndsAt.toISOString();
      
      console.log('Moving to result phase with result:', result);
      
      // Finalize the current round if it exists
      if (session.current_round_id) {
        await finalizeRound(supabase, session.current_round_id, result);
      }
      break;

    case 'result':
      // Move to waiting phase
      nextPhase = 'waiting';
      nextPhaseEndsAt = new Date(now.getTime() + (session.waiting_duration_seconds * 1000));
      updateData.phase = nextPhase;
      updateData.phase_ends_at = nextPhaseEndsAt.toISOString();
      
      console.log('Moving to waiting phase');
      break;

    case 'waiting':
      // Create new round and move to betting phase
      const newRound = await createNewRound(supabase, session.betting_duration_seconds);
      nextPhase = 'betting';
      nextPhaseEndsAt = new Date(now.getTime() + (session.betting_duration_seconds * 1000));
      
      updateData.phase = nextPhase;
      updateData.phase_ends_at = nextPhaseEndsAt.toISOString();
      updateData.current_round_id = newRound.id;
      
      console.log('Moving to betting phase with new round:', newRound.id);
      break;

    default:
      throw new Error(`Unknown phase: ${session.phase}`);
  }

  // Update the session
  const { error: updateError } = await supabase
    .from('game_sessions')
    .update(updateData)
    .eq('id', session.id);

  if (updateError) {
    console.error('Error updating session:', updateError);
    throw updateError;
  }

  console.log('Session updated successfully to phase:', updateData.phase);
}

async function createNewRound(supabase: any, bettingDurationSeconds: number) {
  const now = new Date();
  const bettingEndsAt = new Date(now.getTime() + (bettingDurationSeconds * 1000));

  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .insert({
      betting_ends_at: bettingEndsAt.toISOString(),
      started_at: now.toISOString()
    })
    .select()
    .single();

  if (roundError) {
    console.error('Error creating round:', roundError);
    throw roundError;
  }

  console.log('New round created:', round.id);
  return round;
}

async function finalizeRound(supabase: any, roundId: string, result: string) {
  console.log('Finalizing round with result:', result);

  // Update the round with the result
  const { error: roundUpdateError } = await supabase
    .from('rounds')
    .update({
      result: result,
      ended_at: new Date().toISOString()
    })
    .eq('id', roundId);

  if (roundUpdateError) {
    console.error('Error updating round:', roundUpdateError);
    throw roundUpdateError;
  }

  // Process coin winnings using the database function
  const { data: winningsData, error: winningsError } = await supabase.rpc('process_coin_winnings', {
    _round_id: roundId,
    _result: result
  });

  if (winningsError) {
    console.error('Error processing coin winnings:', winningsError);
    throw winningsError;
  }

  console.log('Round finalized and winnings processed:', winningsData);
}