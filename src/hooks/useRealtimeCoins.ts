import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserCoins {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export const useRealtimeCoins = () => {
  const { user } = useAuth();
  const [userCoins, setUserCoins] = useState<UserCoins | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial coin data
  const fetchUserCoins = async () => {
    if (!user) {
      setUserCoins(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-user-coins');
      
      if (error) {
        console.error('Error fetching user coins:', error);
        return;
      }

      if (data && data.success) {
        setUserCoins(data.coins);
      }
    } catch (error) {
      console.error('Failed to fetch user coins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      setUserCoins(null);
      setLoading(false);
      return;
    }

    // Fetch initial data
    fetchUserCoins();

    // Set up real-time subscription for user_coins table
    const channel = supabase
      .channel('user-coins-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_coins',
          filter: `user_id=eq.${user.id}` // Only listen to changes for this user
        },
        (payload) => {
          console.log('Real-time coin update received:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            // Update the coin data with the new values
            setUserCoins(payload.new as UserCoins);
          } else if (payload.eventType === 'DELETE') {
            // Handle deletion (shouldn't happen often)
            setUserCoins(null);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time coin updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to real-time coin updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from real-time coin updates');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Manual refresh function
  const refreshCoins = () => {
    fetchUserCoins();
  };

  return {
    userCoins,
    loading,
    refreshCoins
  };
};