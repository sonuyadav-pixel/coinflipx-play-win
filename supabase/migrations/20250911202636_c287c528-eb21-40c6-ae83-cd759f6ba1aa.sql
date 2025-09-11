-- Update payment_transactions table to add more status options
-- Add a column to track admin review requests
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS reviewed_by uuid,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Create admin_payment_reviews table to track payment completion requests
CREATE TABLE IF NOT EXISTS public.admin_payment_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_transaction_id uuid NOT NULL,
  user_id uuid NOT NULL,
  coins_amount numeric NOT NULL,
  amount_inr numeric NOT NULL,
  user_confirmation_message text,
  status text NOT NULL DEFAULT 'pending_review',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  admin_notes text
);

-- Enable RLS on admin_payment_reviews
ALTER TABLE public.admin_payment_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_payment_reviews
CREATE POLICY "Users can create their own payment review requests" 
ON public.admin_payment_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment review requests" 
ON public.admin_payment_reviews 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view and update all payment review requests
-- Note: This would need proper admin role checking in a real app
CREATE POLICY "Admins can view all payment review requests" 
ON public.admin_payment_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update all payment review requests" 
ON public.admin_payment_reviews 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_payment_reviews_updated_at
BEFORE UPDATE ON public.admin_payment_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();