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

    const { bettingDurationSeconds = 60 } = await req.json();

    const now = new Date();
    const bettingEndsAt = new Date(now.getTime() + (bettingDurationSeconds * 1000));

    // Create new round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        betting_ends_at: bettingEndsAt.toISOString(),
        started_at: now.toISOString()
      })
      .select()
      .single();

    if (roundError) {
      console.error('Error creating round:', roundError);
      return new Response(JSON.stringify({ error: 'Failed to create round' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      round: round 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-round function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});