-- Fix RLS policies for rounds table
-- Allow anyone to insert rounds (for system-created rounds)
CREATE POLICY "Anyone can create rounds" 
ON public.rounds 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update rounds (for finalizing results)
CREATE POLICY "Anyone can update rounds" 
ON public.rounds 
FOR UPDATE 
USING (true);