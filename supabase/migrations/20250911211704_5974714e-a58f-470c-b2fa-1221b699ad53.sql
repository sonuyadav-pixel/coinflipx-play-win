-- Enable realtime for user_coins table
ALTER TABLE public.user_coins REPLICA IDENTITY FULL;

-- Add user_coins to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_coins;