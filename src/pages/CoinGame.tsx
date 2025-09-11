import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CoinFlip from "@/components/CoinFlip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import BettingPopup from "@/components/BettingPopup";

const CoinGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState("bet");
  const [timeLeft, setTimeLeft] = useState(60);
  const [result, setResult] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [maxTime, setMaxTime] = useState(60);
  const [headsPercent, setHeadsPercent] = useState(50);
  const [tailsPercent, setTailsPercent] = useState(50);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [popupTimer, setPopupTimer] = useState(10);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [userBet, setUserBet] = useState<any>(null);
  const [showBettingPopup, setShowBettingPopup] = useState(false);
  const [selectedBetSide, setSelectedBetSide] = useState<'Heads' | 'Tails'>('Heads');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Create new round when component mounts
  useEffect(() => {
    createNewRound();
  }, []);

  // Update round stats periodically
  useEffect(() => {
    if (currentRoundId && phase === "bet") {
      const interval = setInterval(() => {
        fetchRoundStats();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentRoundId, phase]);

  const createNewRound = async () => {
    try {
      console.log('Creating new round...');
      
      const { data, error } = await supabase.functions.invoke('create-round', {
        body: { bettingDurationSeconds: 60 }
      });

      console.log('Create round response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setCurrentRoundId(data.round.id);
      setTimeLeft(60);
      setMaxTime(60);
      setPhase("bet");
      setUserBet(null);
      
      console.log('New round created with ID:', data.round.id);
    } catch (error) {
      console.error('Error creating round:', error);
      toast({
        title: "Error",
        description: "Failed to create new round",
        variant: "destructive"
      });
    }
  };

  const fetchRoundStats = async () => {
    if (!currentRoundId) return;

    try {
      console.log('Fetching round stats for round:', currentRoundId);
      
      const { data, error } = await supabase.functions.invoke('get-round-stats', {
        body: { roundId: currentRoundId }
      });

      console.log('Round stats response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setTotalPlayers(data.totalPlayers);
      setHeadsPercent(data.headsPercent);
      setTailsPercent(data.tailsPercent);
    } catch (error) {
      console.error('Error fetching round stats:', error);
    }
  };

  const handleBetClick = (betSide: 'Heads' | 'Tails') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place bets",
        variant: "destructive"
      });
      return;
    }

    if (timeLeft <= 0) {
      toast({
        title: "Betting Closed",
        description: "Betting period has ended",
        variant: "destructive"
      });
      return;
    }

    if (userBet) {
      toast({
        title: "Already Bet",
        description: "You have already placed a bet for this round",
        variant: "destructive"
      });
      return;
    }

    setSelectedBetSide(betSide);
    setShowBettingPopup(true);
  };

  const handlePlaceBet = async (amount: number) => {
    if (!user || !currentRoundId) return;

    setIsPlacingBet(true);
    try {
      console.log('Placing bet:', { roundId: currentRoundId, betSide: selectedBetSide, betAmount: amount });
      
      const { data, error } = await supabase.functions.invoke('place-bet', {
        body: {
          roundId: currentRoundId,
          betSide: selectedBetSide,
          betAmount: amount
        }
      });

      console.log('Place bet response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setUserBet(data.bet);
      setShowBettingPopup(false);
      toast({
        title: "Bet Placed!",
        description: `$${amount} on ${selectedBetSide}`,
      });
      
      // Fetch updated stats
      fetchRoundStats();
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bet",
        variant: "destructive"
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const finalizeCoinFlip = async (coinResult: string) => {
    if (!currentRoundId) return;

    try {
      const { data, error } = await supabase.functions.invoke('finalize-round', {
        body: {
          roundId: currentRoundId,
          result: coinResult
        }
      });

      if (error) throw error;
      
      console.log('Round finalized:', data);
    } catch (error) {
      console.error('Error finalizing round:', error);
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      // Start coin flip animation
      setFlipping(true);
      setTimeout(() => {
        const coin = Math.random() < 0.5 ? "Heads" : "Tails";
        setResult(coin);
        setFlipping(false);
        setShowPopup(true);
        setPopupTimer(10);
        finalizeCoinFlip(coin);
      }, 3000); // Video duration
    } else {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Popup timer effect
  useEffect(() => {
    if (showPopup && popupTimer > 0) {
      const timer = setTimeout(() => setPopupTimer(popupTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showPopup && popupTimer === 0) {
      handleClosePopup();
    }
  }, [showPopup, popupTimer]);

  const handleClosePopup = () => {
    setShowPopup(false);
    setResult(null);
    setPopupTimer(10);
    createNewRound(); // Start new round
  };

  const progress = (timeLeft / maxTime) * 100;

  const handleBackToGame = () => {
    navigate("/game");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient"></div>
      
      {/* Sparkles */}
      <div className="absolute inset-0 sparkles pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <Button 
            variant="glass" 
            onClick={handleBackToGame}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lobby
          </Button>
          <div className="flex items-center gap-2">
            <CoinFlip size="sm" />
            <h1 className="text-xl font-bold bg-gold-gradient bg-clip-text text-transparent">
              CoinFlipX Live
            </h1>
          </div>
        </header>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-2xl mx-auto">
            
            {/* Phase Title */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-8">
              {timeLeft > 0 ? "Betting Phase" : "Coin Flipping"}
            </h1>

            {/* Timer with circular progress - only show during betting */}
            {timeLeft > 0 && (
              <div className="relative w-40 h-40 flex items-center justify-center mb-8 mx-auto">
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={timeLeft <= 10 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 70}
                    initial={false}
                    animate={{ strokeDashoffset: (1 - progress / 100) * 2 * Math.PI * 70 }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div
                  className={`font-mono font-bold transition-all duration-300 ${
                    timeLeft <= 10 ? "text-destructive text-6xl animate-pulse glow-red" : "text-primary text-4xl"
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>
            )}

            {/* Coin Flip Video Animation during flipping phase */}
            {timeLeft <= 0 && !showPopup && (
              <div className="flex flex-col items-center mb-8">
                <video
                  autoPlay
                  muted
                  loop
                  className="w-64 h-64 rounded-full object-cover"
                >
                  <source src="/coin-flip-animation.mp4" type="video/mp4" />
                </video>
                <p className="mt-4 text-lg text-muted-foreground">Flipping coin...</p>
              </div>
            )}

            {/* Coin Flip Video Animation */}
            <AnimatePresence>
              {flipping && (
                <motion.div
                  key="coin-flip-video"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center mb-8"
                >
                  <video
                    autoPlay
                    muted
                    className="w-64 h-64 rounded-full object-cover"
                    onEnded={() => {/* Video will end and result will show */}}
                  >
                    <source src="/src/assets/coin-flip.mp4" type="video/mp4" />
                  </video>
                  <p className="mt-4 text-lg text-muted-foreground">Flipping coin...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Bet Status */}
            {userBet && !showPopup && !flipping && (
              <div className="mb-6 p-4 glass-card rounded-lg border border-green-500">
                <p className="text-green-400 text-center font-semibold">
                  ✅ Bet placed: ${userBet.bet_amount} on {userBet.bet_side}
                </p>
              </div>
            )}

            {/* Betting Phase */}
            {!showPopup && !flipping && (
              <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
                <p className="text-xl text-foreground">Place your bets!</p>
                <p className="text-sm text-muted-foreground">
                  Total Players Betting: {totalPlayers.toLocaleString()}
                </p>

                {/* Live Betting Bar */}
                <div className="w-full glass-card rounded-full h-8 overflow-hidden flex">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-8 text-black font-bold flex items-center justify-center text-sm"
                    style={{ width: `${headsPercent}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${headsPercent}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    {headsPercent}% Heads
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 text-white font-bold flex items-center justify-center text-sm"
                    style={{ width: `${tailsPercent}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${tailsPercent}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    {tailsPercent}% Tails
                  </motion.div>
                </div>

                {/* Betting Buttons */}
                <div className="flex gap-6">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => handleBetClick('Heads')}
                      disabled={!!userBet || timeLeft <= 0}
                      className={`px-8 py-4 text-lg font-bold shadow-lg flex items-center gap-2 ${
                        userBet || timeLeft <= 0 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black'
                      }`}
                    >
                      <CircleDollarSign className="w-5 h-5" />
                      Bet on Heads
                    </Button>
                  </motion.div>
                  
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => handleBetClick('Tails')}
                      disabled={!!userBet || timeLeft <= 0}
                      className={`px-8 py-4 text-lg font-bold shadow-lg flex items-center gap-2 ${
                        userBet || timeLeft <= 0 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      }`}
                    >
                      <CircleDollarSign className="w-5 h-5" />
                      Bet on Tails
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Show bet result in popup */}
            {showPopup && result && userBet && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <motion.div className="glass-card p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4 relative">
                  <button onClick={handleClosePopup} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center">✕</button>
                  <h2 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-6">It's {result}!</h2>
                  <CoinFlip size="lg" className="coin-glow mx-auto mb-6" />
                  
                  {/* Show if user won */}
                  <div className="mt-4 p-4 rounded-lg bg-black/20">
                    <p className={`font-bold text-lg ${userBet.bet_side === result ? 'text-green-400' : 'text-red-400'}`}>
                      {userBet.bet_side === result ? '🎉 You Won!' : '😞 You Lost'}
                    </p>
                    <p className="text-sm text-muted-foreground">Your bet: ${userBet.bet_amount} on {userBet.bet_side}</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
                    <div className="w-6 h-6 rounded-full border-2 border-primary relative">
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono">{popupTimer}</span>
                    </div>
                    <span className="text-sm">Auto-close</span>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Betting Popup */}
      <BettingPopup
        isOpen={showBettingPopup}
        onClose={() => setShowBettingPopup(false)}
        onPlaceBet={handlePlaceBet}
        betSide={selectedBetSide}
        isPlacing={isPlacingBet}
      />

      {/* Result Popup */}
      <AnimatePresence>
        {showPopup && result && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="glass-card p-12 rounded-3xl shadow-2xl text-center max-w-md mx-4 relative"
            >
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <h2 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-6">
                Result!
              </h2>
              <motion.div
                className="flex justify-center mb-6"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 1 }}
              >
                <CoinFlip size="lg" className="coin-glow" />
              </motion.div>
              <p className="text-2xl font-bold text-foreground mb-4">
                It's {result}!
              </p>
              
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 rounded-full border-2 border-primary relative">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) ${(10 - popupTimer) * 36}deg, transparent 0deg)`
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono">
                    {popupTimer}
                  </span>
                </div>
                <span className="text-sm">Auto-close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinGame;