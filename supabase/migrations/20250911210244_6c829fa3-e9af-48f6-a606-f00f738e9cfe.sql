-- Update database functions to create transaction records

-- Update the process_coin_bet function to create transaction records
CREATE OR REPLACE FUNCTION public.process_coin_bet(_user_id uuid, _round_id uuid, _bet_side text, _coin_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Create bet record
  INSERT INTO public.bets (user_id, round_id, bet_side, bet_amount, coin_amount)
  VALUES (_user_id, _round_id, _bet_side, _coin_amount, _coin_amount)
  RETURNING * INTO new_bet;
  
  -- Create transaction record for the bet
  INSERT INTO public.coin_transactions (user_id, type, amount, description, reference_id, reference_type, metadata)
  VALUES (_user_id, 'loss', -_coin_amount, 'Placed ' || _bet_side || ' bet - ' || _coin_amount || ' coins', new_bet.id, 'bet', 
    json_build_object('bet_side', _bet_side, 'round_id', _round_id));
  
  RETURN json_build_object('success', true, 'bet', row_to_json(new_bet));
END;
$function$;

-- Update the process_coin_winnings function to create transaction records
CREATE OR REPLACE FUNCTION public.process_coin_winnings(_round_id uuid, _result text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  winning_bet RECORD;
  total_winners INTEGER := 0;
  total_winnings NUMERIC := 0;
BEGIN
  -- Process all winning bets for this round
  FOR winning_bet IN 
    SELECT * FROM public.bets 
    WHERE round_id = _round_id 
    AND bet_side = _result 
    AND coin_amount IS NOT NULL
  LOOP
    -- Calculate winnings (2x the bet)
    UPDATE public.bets 
    SET coin_winnings = coin_amount * 2,
        is_winner = true
    WHERE id = winning_bet.id;
    
    -- Add winnings to user balance
    UPDATE public.user_coins 
    SET balance = balance + (winning_bet.coin_amount * 2),
        total_earned = total_earned + (winning_bet.coin_amount * 2),
        updated_at = now()
    WHERE user_id = winning_bet.user_id;
    
    -- Create win transaction record
    INSERT INTO public.coin_transactions (user_id, type, amount, description, reference_id, reference_type, metadata)
    VALUES (winning_bet.user_id, 'win', winning_bet.coin_amount * 2, 
      'Won ' || (winning_bet.coin_amount * 2) || ' coins (' || winning_bet.bet_side || ' bet)', 
      winning_bet.id, 'bet', 
      json_build_object('bet_side', winning_bet.bet_side, 'round_id', _round_id, 'result', _result));
    
    -- Update the loss transaction to show the result
    UPDATE public.coin_transactions 
    SET metadata = metadata || json_build_object('result', _result)
    WHERE reference_id = winning_bet.id AND type = 'loss';
    
    total_winners := total_winners + 1;
    total_winnings := total_winnings + (winning_bet.coin_amount * 2);
  END LOOP;
  
  -- Mark losing bets and update their transaction records
  UPDATE public.bets 
  SET is_winner = false,
      coin_winnings = 0
  WHERE round_id = _round_id 
  AND bet_side != _result 
  AND coin_amount IS NOT NULL;
  
  -- Update losing transaction records with result
  UPDATE public.coin_transactions 
  SET metadata = metadata || json_build_object('result', _result)
  WHERE reference_id IN (
    SELECT id FROM public.bets 
    WHERE round_id = _round_id 
    AND bet_side != _result 
    AND coin_amount IS NOT NULL
  ) AND type = 'loss';
  
  RETURN json_build_object(
    'success', true,
    'total_winners', total_winners,
    'total_winnings', total_winnings
  );
END;
$function$;