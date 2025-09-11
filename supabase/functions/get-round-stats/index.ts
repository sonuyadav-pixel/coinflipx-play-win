import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const roundId = url.searchParams.get('roundId');

    if (!roundId) {
      return new Response(JSON.stringify({ error: 'Round ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get betting statistics for the round
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('bet_side, bet_amount')
      .eq('round_id', roundId);

    if (betsError) {
      console.error('Error fetching bets:', betsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch betting stats' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalPlayers = bets?.length || 0;
    const headsCount = bets?.filter(bet => bet.bet_side === 'Heads').length || 0;
    const tailsCount = bets?.filter(bet => bet.bet_side === 'Tails').length || 0;
    
    const headsPercent = totalPlayers > 0 ? Math.round((headsCount / totalPlayers) * 100) : 50;
    const tailsPercent = totalPlayers > 0 ? Math.round((tailsCount / totalPlayers) * 100) : 50;

    const headsAmount = bets?.filter(bet => bet.bet_side === 'Heads').reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0) || 0;
    const tailsAmount = bets?.filter(bet => bet.bet_side === 'Tails').reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0) || 0;

    return new Response(JSON.stringify({
      totalPlayers,
      headsCount,
      tailsCount,
      headsPercent,
      tailsPercent,
      headsAmount,
      tailsAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-round-stats function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});