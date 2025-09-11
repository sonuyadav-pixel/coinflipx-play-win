-- Create bets table
CREATE TABLE public.bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL,
  user_id UUID NOT NULL,
  bet_side TEXT NOT NULL CHECK (bet_side IN ('Heads', 'Tails')),
  bet_amount DECIMAL(10,2) NOT NULL CHECK (bet_amount > 0),
  is_winner BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bets" 
ON public.bets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets" 
ON public.bets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets" 
ON public.bets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create rounds table to track game rounds
CREATE TABLE public.rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result TEXT CHECK (result IN ('Heads', 'Tails')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  betting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create policy for rounds (viewable by everyone)
CREATE POLICY "Rounds are viewable by everyone" 
ON public.rounds 
FOR SELECT 
USING (true);

-- Add foreign key constraint
ALTER TABLE public.bets 
ADD CONSTRAINT fk_bets_round_id 
FOREIGN KEY (round_id) REFERENCES public.rounds(id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_bets_updated_at
BEFORE UPDATE ON public.bets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_bets_round_id ON public.bets(round_id);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_rounds_betting_ends_at ON public.rounds(betting_ends_at);