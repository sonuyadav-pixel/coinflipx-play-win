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

    // Get all transactions from the coin_transactions table
    const { data: coinTransactions, error: transactionsError } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error('Error fetching coin transactions:', transactionsError);
      return new Response(JSON.stringify({ error: transactionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format transactions for display
    const allTransactions = coinTransactions?.map(transaction => {
      return {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        description: transaction.description,
        bet_side: transaction.metadata?.bet_side || null,
        result: transaction.metadata?.result || null,
        created_at: transaction.created_at,
        ended_at: transaction.updated_at,
        category: transaction.reference_type || 'general',
        status: transaction.metadata?.status || null,
        amount_inr: transaction.metadata?.amount_inr || null
      };
    }) || [];

    // Check if user needs welcome bonus transaction
    const { data: userCoins } = await supabase
      .from('user_coins')
      .select('created_at, total_earned')
      .eq('user_id', user.id)
      .single();

    // Add welcome bonus if no transactions exist
    if (userCoins && allTransactions.length === 0) {
      // Create the welcome bonus transaction in the database
      const { error: bonusError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          type: 'bonus',
          amount: 1000,
          description: 'Welcome bonus - 1000 free coins!',
          reference_type: 'bonus',
          metadata: {
            welcome_bonus: true
          }
        });

      if (!bonusError) {
        allTransactions.unshift({
          id: 'welcome-bonus',
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