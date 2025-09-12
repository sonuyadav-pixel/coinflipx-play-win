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
    const coinsChannel = supabase
      .channel(`user-coins-${user.id}`)
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
            if (payload.new && typeof payload.new === 'object') {
              const newCoins = payload.new as UserCoins;
              console.log('Setting new coins:', newCoins);
              setUserCoins(newCoins);
              
              // Trigger a custom event so other components can refresh
              window.dispatchEvent(new CustomEvent('coinsUpdated', { detail: newCoins }));
            }
          } else if (payload.eventType === 'DELETE') {
            // Handle deletion (shouldn't happen often)
            console.log('Coin record deleted');
            setUserCoins(null);
          }
        }
      )
      .subscribe((status) => {
        console.log('Coins subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time coin updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to real-time coin updates');
        } else if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('Subscription closed');
        }
      });

    // Set up real-time subscription for payment reviews to catch status updates
    const paymentChannel = supabase
      .channel(`payment-reviews-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'admin_payment_reviews',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Payment review status update:', payload);
          
          // Trigger custom events based on status changes
          if (payload.new?.status === 'approved') {
            window.dispatchEvent(new CustomEvent('paymentApproved', { 
              detail: payload.new 
            }));
          } else if (payload.new?.status === 'rejected') {
            window.dispatchEvent(new CustomEvent('paymentRejected', { 
              detail: payload.new 
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('Payment reviews subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Unsubscribing from real-time updates');
      supabase.removeChannel(coinsChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [user?.id]);

  // Manual refresh function
  const refreshCoins = async () => {
    console.log('Manually refreshing coins...');
    await fetchUserCoins();
  };

  return {
    userCoins,
    loading,
    refreshCoins
  };
};