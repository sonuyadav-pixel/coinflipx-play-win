import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('place-bet function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the auth header first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Auth token received:', token ? 'Present' : 'Missing');

    // Create Supabase client with the user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);

    const { roundId, betSide, betAmount } = await req.json();

    // Validate input
    if (!roundId || !betSide || !betAmount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['Heads', 'Tails'].includes(betSide)) {
      return new Response(JSON.stringify({ error: 'Invalid bet side' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (betAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid bet amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if round exists and betting is still allowed
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return new Response(JSON.stringify({ error: 'Round not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const bettingEndsAt = new Date(round.betting_ends_at);
    
    if (now >= bettingEndsAt) {
      return new Response(JSON.stringify({ error: 'Betting period has ended' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has a bet for this round
    const { data: existingBet, error: betCheckError } = await supabase
      .from('bets')
      .select('id')
      .eq('round_id', roundId)
      .eq('user_id', user.id)
      .single();

    if (existingBet) {
      return new Response(JSON.stringify({ error: 'You have already placed a bet for this round' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Place the bet
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        round_id: roundId,
        user_id: user.id,
        bet_side: betSide,
        bet_amount: betAmount
      })
      .select()
      .single();

    if (betError) {
      console.error('Error placing bet:', betError);
      return new Response(JSON.stringify({ error: 'Failed to place bet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      bet: bet 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in place-bet function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});