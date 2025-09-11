import { useState, useEffect } from 'react';
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <CoinFlip size="lg" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              CoinFlipX
            </h1>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Play And Win Big
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Flip the coin, test your luck, win real rewards. 
            Experience the thrill of premium gaming with every flip.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4 min-w-48"
              onClick={handleStartPlaying}
            >
              Start Playing Now
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-6 text-center rounded-2xl">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2 text-foreground">Fair Play</h3>
            <p className="text-sm text-muted-foreground">
              Provably fair algorithms ensure every flip is completely random
            </p>
          </div>
          <div className="glass-card p-6 text-center rounded-2xl">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold mb-2 text-foreground">Real Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Win real money and prizes with every successful prediction
            </p>
          </div>
          <div className="glass-card p-6 text-center rounded-2xl">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-foreground">Instant Play</h3>
            <p className="text-sm text-muted-foreground">
              Quick registration and instant gameplay. Start winning now!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
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