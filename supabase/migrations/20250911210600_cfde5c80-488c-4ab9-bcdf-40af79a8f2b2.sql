-- Enable real-time updates for coin_transactions table
ALTER TABLE public.coin_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;