import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CoinFlip from '@/components/CoinFlip';
import LoginModal from '@/components/LoginModal';
import CoinHistoryModal from '@/components/CoinHistoryModal';
import BuyCoinsModal from '@/components/BuyCoinsModal';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeCoins } from '@/hooks/useRealtimeCoins';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Coins } from 'lucide-react';
import goldSparkle from '@/assets/gold-sparkle.png';

const Game = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCoinHistory, setShowCoinHistory] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { userCoins } = useRealtimeCoins(); // Use real-time coin updates
  const navigate = useNavigate();

  // Redirect unauthenticated users to home page
  useEffect(() => {
    if (!user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleAddCoins = () => {
    console.log('Add coins clicked');
    setShowCoinHistory(false);
    setShowBuyCoins(true);
    console.log('Buy coins modal should open now');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <CoinFlip size="lg" className="coin-glow" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <CoinFlip size="sm" />
            <h1 className="text-xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              CoinFlipX
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Coin Balance - Clickable */}
            {userCoins && (
              <button
                onClick={() => setShowCoinHistory(true)}
                className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Coins className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Your Coins</p>
                  <p className="text-lg font-bold text-primary">{Math.floor(userCoins.balance).toLocaleString()}</p>
                </div>
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="text-sm font-medium text-foreground">Sign Out</p>
              </div>
            </button>
          </div>
        </header>

        {/* Coming Soon Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <CoinFlip size="md" className="coin-glow" />
            <CoinFlip size="lg" className="mx-auto" />
            <CoinFlip size="md" className="coin-glow" />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              Play and win Coins
            </h1>
            <img src={goldSparkle} alt="Gold sparkle" className="w-12 h-12 md:w-16 md:h-16 animate-pulse" />
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            The ultimate coin flipping experience is here! 
            Start with 1000 free coins and play to win more!
          </p>

          <div className="glass-card p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">What to Expect</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-primary">✨</span>
                <div>
                  <h3 className="font-medium text-foreground">Real-time Gaming</h3>
                  <p className="text-sm text-muted-foreground">Live coin flips with instant results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary">🪙</span>
                <div>
                  <h3 className="font-medium text-foreground">Virtual Coins</h3>
                  <p className="text-sm text-muted-foreground">Play with virtual coins - no real money</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary">💎</span>
                <div>
                  <h3 className="font-medium text-foreground">2X Winnings</h3>
                  <p className="text-sm text-muted-foreground">Double your coins when you win</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary">📱</span>
                <div>
                  <h3 className="font-medium text-foreground">Mobile Optimized</h3>
                  <p className="text-sm text-muted-foreground">Perfect gaming on any device</p>
                </div>
              </div>
            </div>
          </div>

            <Button 
              variant="hero" 
              size="lg"
              className="px-8 py-3"
              onClick={() => navigate('/coin-game')}
            >
              Play Now
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <p className="text-sm text-muted-foreground text-center">
              18+ Only | Play Responsibly | Virtual Coins Only
            </p>
          </div>
        </div>
      </div>

      {/* Coin History Modal */}
      <CoinHistoryModal
        isOpen={showCoinHistory}
        onClose={() => setShowCoinHistory(false)}
        userCoins={userCoins}
        onAddCoins={handleAddCoins}
      />

      {/* Buy Coins Modal */}
      <BuyCoinsModal
        isOpen={showBuyCoins}
        onClose={() => setShowBuyCoins(false)}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Game;