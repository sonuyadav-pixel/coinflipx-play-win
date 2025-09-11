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
    // Use service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { roundId, result } = await req.json();

    if (!roundId || !result || !['Heads', 'Tails'].includes(result)) {
      return new Response(JSON.stringify({ error: 'Invalid roundId or result' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      return new Response(JSON.stringify({ error: 'Failed to update round' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update all bets for this round to mark winners and losers
    // First, mark all as losers
    const { error: losersUpdateError } = await supabase
      .from('bets')
      .update({ is_winner: false })
      .eq('round_id', roundId);

    if (losersUpdateError) {
      console.error('Error updating losers:', losersUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update betting results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Then mark winners
    const { error: winnersUpdateError } = await supabase
      .from('bets')
      .update({ is_winner: true })
      .eq('round_id', roundId)
      .eq('bet_side', result);

    if (winnersUpdateError) {
      console.error('Error updating winners:', winnersUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update betting results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the updated statistics
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('bet_side, bet_amount, is_winner')
      .eq('round_id', roundId);

    if (betsError) {
      console.error('Error fetching final bets:', betsError);
    }

    const winners = bets?.filter(bet => bet.is_winner) || [];
    const totalWinningAmount = winners.reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0);

    return new Response(JSON.stringify({ 
      success: true,
      result: result,
      totalBets: bets?.length || 0,
      winners: winners.length,
      totalWinningAmount: totalWinningAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in finalize-round function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});