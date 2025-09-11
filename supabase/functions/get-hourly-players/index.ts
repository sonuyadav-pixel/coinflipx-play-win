import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('get-hourly-players function called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time and 1 hour ago
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

    console.log('Fetching players who bet between:', oneHourAgo.toISOString(), 'and', now.toISOString());

    // Get unique users who placed bets in the last hour
    const { data: bets, error } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneHourAgo.toISOString())
      .lte('created_at', now.toISOString());

    if (error) {
      console.error('Error fetching hourly bets:', error);
      throw error;
    }

    // Count unique users
    const uniqueUsers = new Set(bets?.map(bet => bet.user_id) || []);
    const totalPlayers = uniqueUsers.size;

    console.log('Total unique players in last hour:', totalPlayers);

    const response = {
      success: true,
      totalPlayers,
      timeframe: 'last_hour'
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-hourly-players:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});