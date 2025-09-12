import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GameState {
  phase: 'betting' | 'flipping' | 'result' | 'waiting';
  timeLeft: number;
  currentRoundId: string | null;
  result: string | null;
  phaseStartedAt: string;
  phaseEndsAt: string;
}

export const useGameSession = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch current game state
  const fetchGameState = async () => {
    try {
      console.log('Fetching game state...');
      
      const { data, error } = await supabase.functions.invoke('get-game-state');
      
      if (error) {
        console.error('Error fetching game state:', error);
        setError(error.message);
        return;
      }

      if (data && data.success) {
        console.log('Game state received:', data.gameState);
        setGameState(data.gameState);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to fetch game state:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch game state');
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger game session progression check
  const checkSessionProgress = async () => {
    try {
      console.log('Checking session progress...');
      
      const { data, error } = await supabase.functions.invoke('game-session-manager');
      
      if (error) {
        console.error('Error checking session progress:', error);
        return;
      }

      if (data && data.success && data.progressed) {
        console.log('Session progressed, fetching updated state...');
        // Fetch updated state after progression
        await fetchGameState();
      }
    } catch (error) {
      console.error('Failed to check session progress:', error);
    }
  };

  // Set up real-time subscription for game sessions
  useEffect(() => {
    // Initial fetch
    fetchGameState();

    // Set up realtime subscription for game_sessions table
    const channel = supabase
      .channel('game-session-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions'
        },
        (payload) => {
          console.log('Game session update received:', payload);
          
          if (payload.new && typeof payload.new === 'object') {
            const session = payload.new as any;
            const now = new Date();
            const phaseEndsAt = new Date(session.phase_ends_at);
            const timeLeft = Math.max(0, Math.floor((phaseEndsAt.getTime() - now.getTime()) / 1000));
            
            const updatedGameState: GameState = {
              phase: session.phase,
              timeLeft,
              currentRoundId: session.current_round_id,
              result: null, // Will be fetched separately if needed
              phaseStartedAt: session.phase_started_at,
              phaseEndsAt: session.phase_ends_at
            };
            
            console.log('Setting updated game state from realtime:', updatedGameState);
            setGameState(updatedGameState);
          }
        }
      )
      .subscribe((status) => {
        console.log('Game session subscription status:', status);
      });

    // Set up periodic session progress checks (reduced interval for smoother experience)
    const progressInterval = setInterval(() => {
      checkSessionProgress();
    }, 2000); // Check every 2 seconds instead of 5

    // Set up countdown timer
    const timerInterval = setInterval(() => {
      setGameState(prev => {
        if (!prev) return prev;
        
        const newTimeLeft = Math.max(0, prev.timeLeft - 1);
        
        // If time reached 0, trigger session progress check
        if (newTimeLeft === 0 && prev.timeLeft > 0) {
          setTimeout(() => checkSessionProgress(), 100);
        }
        
        return {
          ...prev,
          timeLeft: newTimeLeft
        };
      });
    }, 1000);

    // Cleanup
    return () => {
      console.log('Cleaning up game session subscription');
      supabase.removeChannel(channel);
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return {
    gameState,
    loading,
    error,
    refreshGameState: fetchGameState,
    checkSessionProgress
  };
};