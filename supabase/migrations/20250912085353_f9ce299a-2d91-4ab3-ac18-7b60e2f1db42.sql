-- Enable realtime for admin_payment_reviews table so users get instant status updates
ALTER TABLE public.admin_payment_reviews REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_payment_reviews;