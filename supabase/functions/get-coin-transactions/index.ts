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
    console.log('get-coin-transactions function called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header and extract the JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Set the user context for RLS
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(jwt);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Getting coin transactions for user:', user.id);

    // Get bet transactions (both wins and losses)
    const { data: betTransactions, error: betsError } = await supabase
      .from('bets')
      .select(`
        id,
        coin_amount,
        coin_winnings,
        bet_side,
        is_winner,
        created_at,
        rounds (
          result,
          ended_at
        )
      `)
      .eq('user_id', user.id)
      .not('coin_amount', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (betsError) {
      console.error('Error fetching bet transactions:', betsError);
      return new Response(JSON.stringify({ error: betsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format transactions for display
    const transactions = betTransactions?.map(bet => {
      const isWin = bet.is_winner;
      const amount = parseFloat(bet.coin_amount);
      const winnings = parseFloat(bet.coin_winnings || 0);
      
      return {
        id: bet.id,
        type: isWin ? 'win' : 'loss',
        amount: isWin ? winnings : -amount,
        description: isWin 
          ? `Won ${winnings} coins (${bet.bet_side} bet)` 
          : `Lost ${amount} coins (${bet.bet_side} bet)`,
        bet_side: bet.bet_side,
        result: bet.rounds?.result,
        created_at: bet.created_at,
        ended_at: bet.rounds?.ended_at
      };
    }) || [];

    // Add initial bonus transaction if user just started
    const { data: userCoins } = await supabase
      .from('user_coins')
      .select('created_at, total_earned')
      .eq('user_id', user.id)
      .single();

    if (userCoins && transactions.length === 0) {
      transactions.unshift({
        id: 'initial-bonus',
        type: 'bonus',
        amount: 1000,
        description: 'Welcome bonus - 1000 free coins!',
        bet_side: null,
        result: null,
        created_at: userCoins.created_at,
        ended_at: userCoins.created_at
      });
    }

    console.log('Found transactions:', transactions.length);

    return new Response(JSON.stringify({
      success: true,
      transactions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-coin-transactions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});