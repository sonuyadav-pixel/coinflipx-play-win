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
        <header className="flex justify-between items-center p-3 sm:p-4 md:p-6 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <CoinFlip size="sm" />
            <h1 className="text-sm sm:text-base md:text-xl font-bold bg-gold-gradient bg-clip-text text-transparent truncate">
              CoinFlipX
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* User Coin Balance - Clickable */}
            {userCoins && (
              <button
                onClick={() => setShowCoinHistory(true)}
                className="flex items-center gap-1 sm:gap-2 glass-card px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-w-0"
              >
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <div className="text-right min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden xs:block">Your Coins</p>
                  <p className="text-xs sm:text-sm md:text-lg font-bold text-primary truncate">{Math.floor(userCoins.balance).toLocaleString()}</p>
                </div>
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 sm:gap-2 glass-card px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Account</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">Sign Out</p>
              </div>
            </button>
          </div>
        </header>

        {/* Coming Soon Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="text-center max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
            <CoinFlip size="lg" className="coin-glow" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
            <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl animate-pulse">💵</span>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gold-gradient bg-clip-text text-transparent text-center">
              Play and win Coins
            </h1>
            <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl animate-pulse">💵</span>
          </div>
          
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
            The ultimate coin flipping experience is here! 
            Start with 1000 free coins and play to win more!
          </p>

          <Button 
            variant="hero" 
            size="lg"
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-3 md:py-4 text-base sm:text-lg md:text-xl font-bold mb-4 sm:mb-6 md:mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs active:scale-95"
            onClick={() => navigate('/coin-game')}
          >
            Play Now
          </Button>

          <div className="glass-card p-3 sm:p-4 md:p-8 rounded-2xl mb-4 sm:mb-6 md:mb-8 mx-2 sm:mx-4 md:mx-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-3 sm:mb-4">What to Expect</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary text-base sm:text-lg flex-shrink-0">✨</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-xs xs:text-sm md:text-base">Real-time Gaming</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Live coin flips with instant results</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary text-base sm:text-lg flex-shrink-0">🪙</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-xs xs:text-sm md:text-base">Virtual Coins</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Play with virtual coins - no real money</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary text-base sm:text-lg flex-shrink-0">💎</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-xs xs:text-sm md:text-base">2X Winnings</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Double your coins when you win</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary text-base sm:text-lg flex-shrink-0">📱</span>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-xs xs:text-sm md:text-base">Mobile Optimized</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Perfect gaming on any device</p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="mt-2 sm:mt-4 md:mt-8 px-2 sm:px-4">
            <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground text-center">
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