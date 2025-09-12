-- Update game session durations
UPDATE public.game_sessions 
SET result_duration_seconds = 5 
WHERE is_active = true;

-- Update default for future sessions
ALTER TABLE public.game_sessions 
ALTER COLUMN result_duration_seconds SET DEFAULT 5;