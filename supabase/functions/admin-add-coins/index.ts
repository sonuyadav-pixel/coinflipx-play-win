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
    console.log('admin-add-coins function called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const { email, coinAmount, user_email, coin_amount } = body;
    
    // Accept both parameter formats for compatibility
    const userEmail = email || user_email;
    const coinsToAdd = coinAmount || coin_amount;
    
    if (!userEmail || !coinsToAdd) {
      console.error('Missing parameters:', { userEmail, coinsToAdd });
      return new Response(JSON.stringify({ 
        error: 'Email and coinAmount are required',
        received: { userEmail, coinsToAdd }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Adding ${coinsToAdd} coins to user with email: ${userEmail}`);

    // Call the admin function
    const { data, error } = await supabase.rpc('admin_add_coins', {
      _user_email: userEmail,
      _coin_amount: coinsToAdd
    });

    if (error) {
      console.error('Error calling admin_add_coins RPC:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('admin_add_coins RPC result:', data);

    // Check if the database function returned an error
    if (data && data.error) {
      console.error('Database function returned error:', data.error);
      return new Response(JSON.stringify(data), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully added coins. Final response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-add-coins function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});