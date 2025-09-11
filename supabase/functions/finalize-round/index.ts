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
    console.log('finalize-round function called with:', { roundId, result });
    
    // Use service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { roundId, result } = await req.json();

    if (!roundId || !result || !['Heads', 'Tails'].includes(result)) {
      console.error('Invalid parameters:', { roundId, result });
      return new Response(JSON.stringify({ error: 'Invalid roundId or result' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Updating round with result:', result);

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

    console.log('Processing coin winnings...');
    
    // Process coin winnings using the database function
    const { data: winningsData, error: winningsError } = await supabase.rpc('process_coin_winnings', {
      _round_id: roundId,
      _result: result
    });

    if (winningsError) {
      console.error('Error processing coin winnings:', winningsError);
      return new Response(JSON.stringify({ error: 'Failed to process coin winnings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Coin winnings processed:', winningsData);

    // Get the updated statistics
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('bet_side, bet_amount, is_winner, coin_amount, coin_winnings')
      .eq('round_id', roundId);

    if (betsError) {
      console.error('Error fetching final bets:', betsError);
    }

    const winners = bets?.filter(bet => bet.is_winner) || [];
    const totalWinningAmount = winners.reduce((sum, bet) => sum + parseFloat(bet.bet_amount), 0);
    const totalCoinWinnings = winners.reduce((sum, bet) => sum + parseFloat(bet.coin_winnings || 0), 0);

    console.log('Round finalized successfully:', {
      totalBets: bets?.length || 0,
      winners: winners.length,
      totalWinningAmount,
      totalCoinWinnings
    });

    return new Response(JSON.stringify({ 
      success: true,
      result: result,
      totalBets: bets?.length || 0,
      winners: winners.length,
      totalWinningAmount: totalWinningAmount,
      totalCoinWinnings: totalCoinWinnings,
      winningsProcessed: winningsData
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