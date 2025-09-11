-- Create a comprehensive coin transactions table to track all coin movements
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('win', 'loss', 'bonus', 'admin_add', 'purchase_pending', 'purchase_completed', 'purchase_rejected')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID NULL, -- Can reference bet_id, payment_id, etc.
  reference_type TEXT NULL, -- 'bet', 'payment', 'admin', 'bonus'
  metadata JSONB NULL, -- Store additional data like bet_side, result, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own coin transactions" 
ON public.coin_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert coin transactions" 
ON public.coin_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update coin transactions" 
ON public.coin_transactions 
FOR UPDATE 
USING (true);

-- Add trigger for timestamp updates
CREATE TRIGGER update_coin_transactions_updated_at
BEFORE UPDATE ON public.coin_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_coin_transactions_user_id_created_at ON public.coin_transactions(user_id, created_at DESC);

-- Enable real-time for coin transactions
ALTER TABLE public.coin_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;