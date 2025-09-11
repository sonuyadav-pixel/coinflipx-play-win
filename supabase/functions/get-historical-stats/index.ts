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
    console.log('get-historical-stats function called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the last 10 completed rounds with results
    const { data: rounds, error } = await supabase
      .from('rounds')
      .select('result')
      .not('result', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching historical rounds:', error);
      throw error;
    }

    console.log('Last 10 rounds:', rounds);

    // Calculate percentages
    let headsCount = 0;
    let tailsCount = 0;

    rounds.forEach(round => {
      if (round.result === 'Heads') {
        headsCount++;
      } else if (round.result === 'Tails') {
        tailsCount++;
      }
    });

    const totalRounds = rounds.length;
    const headsPercent = totalRounds > 0 ? Math.round((headsCount / totalRounds) * 100) : 50;
    const tailsPercent = totalRounds > 0 ? Math.round((tailsCount / totalRounds) * 100) : 50;

    // Ensure percentages add up to 100
    const adjustedTailsPercent = 100 - headsPercent;

    const response = {
      success: true,
      totalRounds,
      headsCount,
      tailsCount,
      headsPercent,
      tailsPercent: adjustedTailsPercent,
      rounds: rounds.map(r => r.result)
    };

    console.log('Historical stats response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-historical-stats:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});