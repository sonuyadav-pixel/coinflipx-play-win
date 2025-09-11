-- Fix the process_coin_bet function to handle data types correctly
CREATE OR REPLACE FUNCTION public.process_coin_bet(
  _user_id UUID,
  _round_id UUID,
  _bet_side TEXT,
  _coin_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance NUMERIC;
  new_bet public.bets;
BEGIN
  -- Initialize user coins if they don't exist
  PERFORM public.initialize_user_coins(_user_id);
  
  -- Get current balance
  SELECT balance INTO user_balance 
  FROM public.user_coins 
  WHERE user_id = _user_id;
  
  -- Check if user has enough coins
  IF user_balance < _coin_amount THEN
    RETURN json_build_object('error', 'Insufficient coins');
  END IF;
  
  -- Deduct coins from balance
  UPDATE public.user_coins 
  SET balance = balance - _coin_amount,
      total_spent = total_spent + _coin_amount,
      updated_at = now()
  WHERE user_id = _user_id;
  
  -- Create bet record with correct data types
  INSERT INTO public.bets (user_id, round_id, bet_side, bet_amount, coin_amount)
  VALUES (_user_id, _round_id, _bet_side, _coin_amount, _coin_amount)
  RETURNING * INTO new_bet;
  
  RETURN json_build_object('success', true, 'bet', row_to_json(new_bet));
END;
$$;