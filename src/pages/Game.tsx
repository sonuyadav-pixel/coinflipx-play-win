import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CoinFlip from '@/components/CoinFlip';
import LoginModal from '@/components/LoginModal';

const Game = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header with Login */}
        <div className="absolute top-6 right-6">
          <Button 
            variant="glass" 
            onClick={() => setIsModalOpen(true)}
            className="px-6"
          >
            Login
          </Button>
        </div>

        {/* Coming Soon Content */}
        <div className="text-center max-w-2xl mx-auto">
          <CoinFlip size="lg" className="mx-auto mb-8" />
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-6">
            Coming Soon
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            The ultimate coin flipping experience is being crafted. 
            Get ready for the most thrilling gaming adventure!
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
                <span className="text-primary">🏆</span>
                <div>
                  <h3 className="font-medium text-foreground">Tournaments</h3>
                  <p className="text-sm text-muted-foreground">Compete with players worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary">💎</span>
                <div>
                  <h3 className="font-medium text-foreground">Premium Rewards</h3>
                  <p className="text-sm text-muted-foreground">Exclusive prizes and bonuses</p>
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
            className="text-lg px-8 py-4"
            onClick={() => setIsModalOpen(true)}
          >
            Get Early Access
          </Button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-muted-foreground text-center">
            18+ Only | Play Responsibly | Licensed Gaming Platform
          </p>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Game;