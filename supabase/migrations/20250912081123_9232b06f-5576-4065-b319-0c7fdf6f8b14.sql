-- Add game session management
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase TEXT NOT NULL DEFAULT 'betting' CHECK (phase IN ('betting', 'flipping', 'result', 'waiting')),
  current_round_id UUID,
  phase_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  phase_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  betting_duration_seconds INTEGER NOT NULL DEFAULT 60,
  flipping_duration_seconds INTEGER NOT NULL DEFAULT 7,
  result_duration_seconds INTEGER NOT NULL DEFAULT 30,
  waiting_duration_seconds INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for game sessions (public read access)
CREATE POLICY "Game sessions are viewable by everyone" 
ON public.game_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage game sessions" 
ON public.game_sessions 
FOR ALL
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Initialize a default game session
INSERT INTO public.game_sessions (phase_ends_at) 
VALUES (now() + interval '60 seconds');