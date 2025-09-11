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
      .limit(25);

    if (betsError) {
      console.error('Error fetching bet transactions:', betsError);
      return new Response(JSON.stringify({ error: betsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payment transactions 
    const { data: paymentTransactions, error: paymentsError } = await supabase
      .from('admin_payment_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(25);

    if (paymentsError) {
      console.error('Error fetching payment transactions:', paymentsError);
      return new Response(JSON.stringify({ error: paymentsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format bet transactions for display
    const betTransactionsList = betTransactions?.map(bet => {
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
        ended_at: bet.rounds?.ended_at,
        category: 'game'
      };
    }) || [];

    // Format payment transactions for display
    const paymentTransactionsList = paymentTransactions?.map(payment => {
      return {
        id: `payment-${payment.id}`,
        type: payment.status === 'approved' ? 'purchase_completed' : 
              payment.status === 'rejected' ? 'purchase_rejected' : 'purchase_pending',
        amount: payment.status === 'approved' ? payment.coins_amount : 0,
        description: payment.status === 'approved' 
          ? `₹${payment.amount_inr} payment approved - ${payment.coins_amount} coins added`
          : payment.status === 'rejected'
          ? `₹${payment.amount_inr} payment rejected - ${payment.coins_amount} coins`
          : `₹${payment.amount_inr} payment under review - ${payment.coins_amount} coins pending`,
        bet_side: null,
        result: null,
        created_at: payment.created_at,
        ended_at: payment.reviewed_at || payment.created_at,
        category: 'payment',
        status: payment.status,
        amount_inr: payment.amount_inr
      };
    }) || [];

    // Combine all transactions and sort by created_at
    const allTransactions = [...betTransactionsList, ...paymentTransactionsList]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    // Add initial bonus transaction if user just started
    const { data: userCoins } = await supabase
      .from('user_coins')
      .select('created_at, total_earned')
      .eq('user_id', user.id)
      .single();

    if (userCoins && allTransactions.length === 0) {
      allTransactions.unshift({
        id: 'initial-bonus',
        type: 'bonus',
        amount: 1000,
        description: 'Welcome bonus - 1000 free coins!',
        bet_side: null,
        result: null,
        created_at: userCoins.created_at,
        ended_at: userCoins.created_at,
        category: 'bonus'
      });
    }

    console.log('Found transactions:', allTransactions.length);

    return new Response(JSON.stringify({
      success: true,
      transactions: allTransactions
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