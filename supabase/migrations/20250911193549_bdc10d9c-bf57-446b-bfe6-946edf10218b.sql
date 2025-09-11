-- Add email field to profiles table for user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create an admin function to add coins to any user account
CREATE OR REPLACE FUNCTION public.admin_add_coins(_user_email text, _coin_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  user_coin_record public.user_coins;
BEGIN
  -- Find user by email from profiles table
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE email = _user_email;
  
  -- If not found in profiles, check auth.users table
  IF target_user_id IS NULL THEN
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = _user_email;
  END IF;
  
  -- If user still not found, return error
  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'User not found with email: ' || _user_email);
  END IF;
  
  -- Initialize user coins if they don't exist
  PERFORM public.initialize_user_coins(target_user_id);
  
  -- Add coins to user balance
  UPDATE public.user_coins 
  SET balance = balance + _coin_amount,
      total_earned = total_earned + _coin_amount,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO user_coin_record;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Added ' || _coin_amount || ' coins to ' || _user_email,
    'new_balance', user_coin_record.balance
  );
END;
$$;

-- Create payment transactions table to track coin purchases
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coins_purchased numeric NOT NULL,
  amount_inr numeric NOT NULL,
  payment_method text DEFAULT 'QR',
  status text DEFAULT 'pending',
  transaction_ref text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for payment_transactions updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();