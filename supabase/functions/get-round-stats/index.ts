import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('get-round-stats function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let roundId;
    
    try {
      const body = await req.text();
      console.log('Request body:', body);
      
      if (body) {
        const parsed = JSON.parse(body);
        roundId = parsed.roundId;
      }
    } catch (parseError) {
      console.log('Error parsing body, trying query params:', parseError);
      // Fallback to query params
      const url = new URL(req.url);
      roundId = url.searchParams.get('roundId');
    }
    
    console.log('Round ID:', roundId);

    if (!roundId) {
      console.log('No round ID provided, returning default stats');
      // Return default stats if no round ID
      return new Response(JSON.stringify({
        totalPlayers: 0,
        headsCount: 0,
        tailsCount: 0,
        headsPercent: 50,
        tailsPercent: 50,
        headsAmount: 0,
        tailsAmount: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching bets for round:', roundId);
    
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

    console.log('Bets found:', bets?.length || 0);

    const totalPlayers = bets?.length || 0;
    const headsCount = bets?.filter(bet => bet.bet_side === 'Heads').length || 0;
    const tailsCount = bets?.filter(bet => bet.bet_side === 'Tails').length || 0;
    
    const headsPercent = totalPlayers > 0 ? Math.round((headsCount / totalPlayers) * 100) : 50;
    const tailsPercent = totalPlayers > 0 ? Math.round((tailsCount / totalPlayers) * 100) : 50;

    const headsAmount = bets?.filter(bet => bet.bet_side === 'Heads').reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0) || 0;
    const tailsAmount = bets?.filter(bet => bet.bet_side === 'Tails').reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0) || 0;

    const result = {
      totalPlayers,
      headsCount,
      tailsCount,
      headsPercent,
      tailsPercent,
      headsAmount,
      tailsAmount
    };
    
    console.log('Returning stats:', result);

    return new Response(JSON.stringify(result), {
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