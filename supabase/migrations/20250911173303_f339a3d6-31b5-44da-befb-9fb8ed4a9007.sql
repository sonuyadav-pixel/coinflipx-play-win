-- Create user coin balances table
CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 1000,
  total_earned NUMERIC NOT NULL DEFAULT 1000,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

-- Create policies for user coins
CREATE POLICY "Users can view their own coins" 
ON public.user_coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" 
ON public.user_coins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" 
ON public.user_coins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_coins_updated_at
BEFORE UPDATE ON public.user_coins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user coins when they first play
CREATE OR REPLACE FUNCTION public.initialize_user_coins(_user_id UUID)
RETURNS public.user_coins
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_coin_record public.user_coins;
BEGIN
  -- Try to get existing record
  SELECT * INTO user_coin_record 
  FROM public.user_coins 
  WHERE user_id = _user_id;
  
  -- If no record exists, create one with starting balance
  IF user_coin_record IS NULL THEN
    INSERT INTO public.user_coins (user_id, balance, total_earned)
    VALUES (_user_id, 1000, 1000)
    RETURNING * INTO user_coin_record;
  END IF;
  
  RETURN user_coin_record;
END;
$$;

-- Update bets table to use coins instead of real money
ALTER TABLE public.bets 
ADD COLUMN coin_amount NUMERIC,
ADD COLUMN coin_winnings NUMERIC DEFAULT 0;

-- Create function to process coin bet
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
  
  -- Create bet record
  INSERT INTO public.bets (user_id, round_id, bet_side, bet_amount, coin_amount)
  VALUES (_user_id, _round_id, _bet_side, _coin_amount::TEXT, _coin_amount)
  RETURNING * INTO new_bet;
  
  RETURN json_build_object('success', true, 'bet', row_to_json(new_bet));
END;
$$;

-- Create function to process coin winnings
CREATE OR REPLACE FUNCTION public.process_coin_winnings(
  _round_id UUID,
  _result TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    total_winners := total_winners + 1;
    total_winnings := total_winnings + (winning_bet.coin_amount * 2);
  END LOOP;
  
  -- Mark losing bets
  UPDATE public.bets 
  SET is_winner = false,
      coin_winnings = 0
  WHERE round_id = _round_id 
  AND bet_side != _result 
  AND coin_amount IS NOT NULL;
  
  RETURN json_build_object(
    'success', true,
    'total_winners', total_winners,
    'total_winnings', total_winnings
  );
END;
$$;