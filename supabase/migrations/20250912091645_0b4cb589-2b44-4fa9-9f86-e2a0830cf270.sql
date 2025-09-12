-- Update admin_add_coins function to accept user_id parameter for direct targeting
CREATE OR REPLACE FUNCTION public.admin_add_coins(_user_email text, _coin_amount numeric, _user_id uuid DEFAULT NULL)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  user_coin_record public.user_coins;
BEGIN
  -- If user_id is provided directly, use it (most reliable)
  IF _user_id IS NOT NULL THEN
    target_user_id := _user_id;
    RAISE LOG 'Using direct user_id: %', target_user_id;
  ELSE
    -- Fallback to email lookup
    RAISE LOG 'Looking up user by email: %', _user_email;
    
    -- First try to find user by email from profiles table
    SELECT user_id INTO target_user_id 
    FROM public.profiles 
    WHERE email = _user_email;
    
    -- If not found in profiles, check auth.users table
    IF target_user_id IS NULL THEN
      SELECT id INTO target_user_id 
      FROM auth.users 
      WHERE email = _user_email;
    END IF;
  END IF;
  
  -- If user still not found, return error
  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'User not found with email: ' || _user_email);
  END IF;
  
  RAISE LOG 'Target user ID determined: %', target_user_id;
  
  -- Initialize user coins if they don't exist
  PERFORM public.initialize_user_coins(target_user_id);
  
  -- Add coins to user balance
  UPDATE public.user_coins 
  SET balance = balance + _coin_amount,
      total_earned = total_earned + _coin_amount,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO user_coin_record;
  
  -- Create transaction record for admin coin addition
  INSERT INTO public.coin_transactions (user_id, type, amount, description, reference_type, metadata)
  VALUES (target_user_id, 'admin_add', _coin_amount, 'Admin added ' || _coin_amount || ' coins', 'admin', 
    json_build_object('admin_action', true, 'original_email', _user_email));
  
  RAISE LOG 'Successfully added % coins to user %, new balance: %', _coin_amount, target_user_id, user_coin_record.balance;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Added ' || _coin_amount || ' coins to user ' || target_user_id,
    'user_id', target_user_id,
    'new_balance', user_coin_record.balance
  );
END;
$function$;