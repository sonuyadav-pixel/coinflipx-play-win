-- Update game session durations
-- Update existing active sessions
UPDATE public.game_sessions 
SET 
  betting_duration_seconds = 30,
  flipping_duration_seconds = 5,
  updated_at = now()
WHERE is_active = true;

-- Update default values for future sessions by altering the table
ALTER TABLE public.game_sessions 
ALTER COLUMN betting_duration_seconds SET DEFAULT 30;

ALTER TABLE public.game_sessions 
ALTER COLUMN flipping_duration_seconds SET DEFAULT 5;