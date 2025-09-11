import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

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
    console.log('complete-payment function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user.user) {
      throw new Error('Unauthorized');
    }

    const { payment_transaction_id, coins_amount, amount_inr, user_message } = await req.json();

    console.log('Payment completion request:', {
      payment_transaction_id,
      coins_amount,
      amount_inr,
      user_id: user.user.id
    });

    // Validate required fields
    if (!payment_transaction_id || !coins_amount || !amount_inr) {
      throw new Error('Missing required fields');
    }

    // Update payment transaction status to awaiting review
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'awaiting_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_transaction_id)
      .eq('user_id', user.user.id);

    if (updateError) {
      console.error('Error updating payment transaction:', updateError);
      throw updateError;
    }

    // Create admin review request
    const { data: reviewRequest, error: reviewError } = await supabase
      .from('admin_payment_reviews')
      .insert({
        payment_transaction_id,
        user_id: user.user.id,
        coins_amount,
        amount_inr,
        user_confirmation_message: user_message || 'Payment completed via QR code',
        status: 'pending_review'
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating admin review request:', reviewError);
      throw reviewError;
    }

    console.log('Admin review request created:', reviewRequest);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment completion request submitted for admin review',
      review_id: reviewRequest.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in complete-payment function:', error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});