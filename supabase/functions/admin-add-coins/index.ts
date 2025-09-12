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
    
    const { email, coinAmount, user_email, coin_amount, user_id } = body;
    
    // Accept both parameter formats for compatibility
    const userEmail = email || user_email;
    const coinsToAdd = coinAmount || coin_amount;
    const targetUserId = user_id; // Direct user ID takes priority
    
    if ((!userEmail && !targetUserId) || !coinsToAdd) {
      console.error('Missing parameters:', { userEmail, targetUserId, coinsToAdd });
      return new Response(JSON.stringify({ 
        error: 'Either email or user_id, and coinAmount are required',
        received: { userEmail, targetUserId, coinsToAdd }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let finalUserId = targetUserId;

    // If user_id is provided directly, use it (most reliable)
    if (targetUserId) {
      console.log(`Using direct user ID: ${targetUserId} to add ${coinsToAdd} coins`);
      finalUserId = targetUserId;
    } else {
      // Fallback to email lookup only if user_id not provided
      console.log(`Looking up user by email: ${userEmail} to add ${coinsToAdd} coins`);

      // First try to find user by email from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', userEmail)
        .single();
      
      if (profileData) {
        finalUserId = profileData.user_id;
      } else {
        // If not found in profiles, check auth.users table
        const { data: authData } = await supabase.auth.admin.listUsers();
        const authUser = authData.users?.find(u => u.email === userEmail);
        if (authUser) {
          finalUserId = authUser.id;
        }
      }
    }
    
    if (!finalUserId) {
      console.error('User not found:', { userEmail, targetUserId });
      return new Response(JSON.stringify({ 
        error: `User not found with ${targetUserId ? 'user_id: ' + targetUserId : 'email: ' + userEmail}`
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Adding ${coinsToAdd} coins to user: ${finalUserId}`);

    // Call the admin function with the correct user ID
    const { data, error } = await supabase.rpc('admin_add_coins', {
      _user_email: userEmail || 'direct_user_id', // Fallback email for function compatibility
      _coin_amount: coinsToAdd,
      _user_id: finalUserId // Pass the actual user ID to ensure correct targeting
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