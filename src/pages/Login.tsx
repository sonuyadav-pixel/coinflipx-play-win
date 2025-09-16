import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CoinFlip from '@/components/CoinFlip';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-srk.jpg';

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to game page
  useEffect(() => {
    if (user && !loading) {
      navigate('/game');
    }
  }, [user, loading, navigate]);

  const handleStartPlaying = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with hero image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Logo/Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <CoinFlip size="lg" />
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              CoinFlipX
            </h1>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <CoinFlip size="md" className="coin-glow" />
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight px-2">
            Play And Win Big 💰
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Flip the coin, test your luck, win real rewards. 
            Experience the thrill of premium gaming with every flip.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center px-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-w-40 sm:min-w-48 w-full max-w-xs"
              onClick={handleStartPlaying}
            >
              Start Playing Now
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
          <div className="glass-card p-4 sm:p-6 text-center rounded-2xl">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
            <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">Fair Play</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Provably fair algorithms ensure every flip is completely random
            </p>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center rounded-2xl">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💰</div>
            <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">Real Rewards</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Win real money and prizes with every successful prediction
            </p>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center rounded-2xl sm:col-span-2 md:col-span-1">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">Instant Play</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Quick registration and instant gameplay. Start winning now!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-16 text-center px-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
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

export default Login;