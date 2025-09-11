-- Fix the process_coin_winnings function to handle jsonb concatenation properly
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
      jsonb_build_object('bet_side', winning_bet.bet_side, 'round_id', _round_id, 'result', _result));
    
    -- Update the loss transaction to show the result (fix: cast to jsonb)
    UPDATE public.coin_transactions 
    SET metadata = metadata || jsonb_build_object('result', _result)
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
  
  -- Update losing transaction records with result (fix: cast to jsonb)
  UPDATE public.coin_transactions 
  SET metadata = metadata || jsonb_build_object('result', _result)
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
$function$