import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleDollarSign, ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CoinFlip from "@/components/CoinFlip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeCoins } from '@/hooks/useRealtimeCoins';
import { useGameSession } from '@/hooks/useGameSession';
import { toast } from "@/hooks/use-toast";
import BettingPopup from "@/components/BettingPopup";
import CoinHistoryModal from "@/components/CoinHistoryModal";
import BuyCoinsModal from "@/components/BuyCoinsModal";
import OnboardingCarousel from "@/components/OnboardingCarousel";
import Confetti from "react-confetti";
import coinTossVideo from '@/assets/coin-toss-animation.mp4';

const CoinGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userCoins, refreshCoins } = useRealtimeCoins();
  const { gameState, loading: gameLoading, error: gameError } = useGameSession();
  
  // Local state for UI management
  const [showPopup, setShowPopup] = useState(false);
  const [headsPercent, setHeadsPercent] = useState(50);
  const [tailsPercent, setTailsPercent] = useState(50);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [recentResults, setRecentResults] = useState<string[]>([]);
  const [popupTimer, setPopupTimer] = useState(5);
  const [userBet, setUserBet] = useState<any>(null);
  const [showBettingPopup, setShowBettingPopup] = useState(false);
  const [selectedBetSide, setSelectedBetSide] = useState<'Heads' | 'Tails'>('Heads');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [userWon, setUserWon] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoinHistory, setShowCoinHistory] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Derived state from server-managed game session
  const phase = gameState?.phase || 'betting';
  const timeLeft = gameState?.timeLeft || 0;
  const result = gameState?.result;
  const currentRoundId = gameState?.currentRoundId;
  const flipping = phase === 'flipping';
  const maxTime = phase === 'betting' ? 30 : phase === 'flipping' ? 5 : phase === 'result' ? 30 : 3;

  console.log('CoinGame render:', { showCoinHistory, showBuyCoins });
  console.log('Current user coins:', userCoins);

  // Show onboarding for all users
  useEffect(() => {
    setShowOnboarding(true);
  }, []);

  // Debug effect to log coin balance changes
  useEffect(() => {
    if (userCoins) {
      console.log('Coin balance updated in CoinGame:', {
        balance: userCoins.balance,
        total_earned: userCoins.total_earned,
        total_spent: userCoins.total_spent,
        updated_at: userCoins.updated_at
      });
    }
  }, [userCoins]);

  // Update round stats and historical data periodically
  useEffect(() => {
    if (phase === 'betting') {
      fetchRoundStats();
      fetchHistoricalStats();
      fetchRecentResults();
      
      const interval = setInterval(() => {
        fetchRoundStats();
        fetchHistoricalStats();
        fetchRecentResults();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Track which round we've shown popup for to prevent duplicates
  const shownPopupForRound = useRef<string | null>(null);

  // Handle phase transitions and result display
  useEffect(() => {
    if (phase === 'result' && result && currentRoundId && shownPopupForRound.current !== currentRoundId) {
      // Mark this round as having shown the popup
      shownPopupForRound.current = currentRoundId;
      
      // Check if user won and show result popup
      if (userBet) {
        const won = userBet.bet_side === result;
        setUserWon(won);
        if (won) {
          setWinAmount(parseFloat(userBet.coin_amount || userBet.bet_amount) * 2);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        } else {
          setWinAmount(0);
        }
      } else {
        setUserWon(null);
        setWinAmount(0);
      }
      
      setShowPopup(true);
      setPopupTimer(5);
    } else if (phase !== 'result') {
      // Hide popup when not in result phase
      setShowPopup(false);
      setShowConfetti(false);
    }
  }, [phase, result, currentRoundId, userBet]);

  // Clear user bet when new round starts
  useEffect(() => {
    if (phase === 'betting' && currentRoundId) {
      setUserBet(null);
      setUserWon(null);
      setWinAmount(0);
      setShowConfetti(false);
      // Reset popup tracking for new round
      shownPopupForRound.current = null;
    }
  }, [phase, currentRoundId]);

  const fetchRoundStats = async () => {
    if (!currentRoundId) return;

    try {
      console.log('Fetching round stats for round:', currentRoundId);
      
      // Fetch hourly players count
      const { data: hourlyData, error: hourlyError } = await supabase.functions.invoke('get-hourly-players');
      
      if (hourlyError) {
        console.error('Supabase function error (hourly):', hourlyError);
      } else {
        setTotalPlayers(hourlyData.totalPlayers || 0);
      }

    } catch (error) {
      console.error('Error fetching round stats:', error);
    }
  };

  const fetchHistoricalStats = async () => {
    try {
      console.log('Fetching historical stats...');
      
      const { data, error } = await supabase.functions.invoke('get-historical-stats');

      console.log('Historical stats response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setHeadsPercent(data.headsPercent);
      setTailsPercent(data.tailsPercent);
    } catch (error) {
      console.error('Error fetching historical stats:', error);
    }
  };

  const fetchRecentResults = async () => {
    try {
      console.log('Fetching recent results...');
      
      const { data, error } = await supabase.functions.invoke('get-recent-results');

      console.log('Recent results response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setRecentResults(data.recentResults || []);
    } catch (error) {
      console.error('Error fetching recent results:', error);
    }
  };

  const handleBetClick = (betSide: 'Heads' | 'Tails') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place bets",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (phase !== 'betting' || timeLeft <= 0) {
      toast({
        title: "Betting Closed",
        description: "Betting period has ended",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (userBet) {
      toast({
        title: "Already Bet",
        description: "You have already placed a bet for this round",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setSelectedBetSide(betSide);
    setShowBettingPopup(true);
  };

  const handlePlaceBet = async (amount: number) => {
    if (!user || !currentRoundId) return;

    // Check if user has enough coins
    if (!userCoins || userCoins.balance < amount) {
      toast({
        title: "Insufficient Coins",
        description: "You don't have enough coins to place this bet",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsPlacingBet(true);
    try {
      console.log('Placing coin bet:', { roundId: currentRoundId, betSide: selectedBetSide, coinAmount: amount });
      
      const { data, error } = await supabase.functions.invoke('place-coin-bet', {
        body: {
          roundId: currentRoundId,
          betSide: selectedBetSide,
          coinAmount: amount
        }
      });

      console.log('Place coin bet response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setUserBet(data.bet);
      setShowBettingPopup(false);
      
      // Immediately refresh coin balance to show updated amount
      console.log('Bet placed successfully, refreshing coin balance...');
      setTimeout(() => {
        refreshCoins();
      }, 100); // Small delay to ensure DB update is complete
      
      // Refresh round stats
      fetchRoundStats();
      
      toast({
        title: "Bet Placed!",
        description: `${amount} coins on ${selectedBetSide}`,
        duration: 2000,
      });
      
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bet",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Handle coin balance refresh after winnings
  useEffect(() => {
    if (userWon && phase === 'result') {
      console.log('User won, refreshing coin balance...');
      setTimeout(() => {
        refreshCoins();
      }, 1000);
    }
  }, [userWon, phase, refreshCoins]);

  // Popup timer effect - now synced with server phase timing
  useEffect(() => {
    if (showPopup && phase === 'result' && popupTimer > 0) {
      const timer = setTimeout(() => setPopupTimer(popupTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'result' && timeLeft > 0) {
      // Sync popup timer with server phase time
      setPopupTimer(timeLeft);
    }
  }, [showPopup, popupTimer, phase, timeLeft]);

  const handleClosePopup = () => {
    // Only allow manual close if not in result phase
    if (phase !== 'result') {
      setShowPopup(false);
      setPopupTimer(5);
      setUserWon(null);
      setWinAmount(0);
      setShowConfetti(false);
    }
  };

  const handleBackToLobby = () => {
    navigate("/game");
  };

  const progress = (timeLeft / maxTime) * 100;

  const handleBackToGame = () => {
    navigate("/game");
  };

  const handleAddCoins = () => {
    console.log('Add coins clicked');
    setShowCoinHistory(false);
    setShowBuyCoins(true);
    console.log('Buy coins modal should open now');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
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
        <header className="flex justify-between items-center p-3 sm:p-4 md:p-6 gap-2">
          <Button 
            variant="glass" 
            onClick={handleBackToGame}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0"
            size="sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Lobby</span>
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 justify-center">
            <CoinFlip size="sm" />
            <h1 className="text-sm sm:text-base md:text-xl font-bold bg-gold-gradient bg-clip-text text-transparent truncate">
              CoinFlipX Live
            </h1>
          </div>
          
          {/* User Coin Balance - Clickable */}
          {user && userCoins && (
            <button
              onClick={() => setShowCoinHistory(true)}
              className="flex items-center gap-1 sm:gap-2 glass-card px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-w-0 shrink-0"
            >
              <Coins className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
              <div className="text-right min-w-0">
                <p className="text-xs sm:text-xs md:text-sm text-muted-foreground">Coins</p>
                <p className="text-sm sm:text-sm md:text-lg font-bold text-primary truncate">{Math.floor(userCoins.balance).toLocaleString()}</p>
              </div>
            </button>
          )}
        </header>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
          <div className="text-center max-w-2xl mx-auto w-full">
            
            {/* Phase Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-6 md:mb-8">
              {phase === 'betting' ? 'Betting Phase' : 
               phase === 'flipping' ? 'Coin Flipping' : 
               phase === 'result' ? 'Results' : 
               'Next Round Starting'}
            </h1>

            {/* Timer with circular progress - only show during betting phase */}
            {phase === 'betting' && timeLeft > 0 && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center mb-4 sm:mb-6 md:mb-8 mx-auto">
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="hsl(var(--muted))"
                    strokeWidth="6"
                    fill="none"
                    className="opacity-30"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={timeLeft <= 10 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 45}
                    initial={false}
                    animate={{ strokeDashoffset: (1 - progress / 100) * 2 * Math.PI * 45 }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div
                  className={`font-mono font-bold transition-all duration-300 ${
                    timeLeft <= 10 ? "text-destructive text-lg sm:text-2xl md:text-4xl lg:text-6xl animate-pulse glow-red" : "text-primary text-base sm:text-xl md:text-3xl lg:text-4xl"
                  }`}
                >
                  {timeLeft}s
                </div>
              </div>
            )}


            {/* Coin Flip Video Animation */}
            <AnimatePresence>
              {phase === 'flipping' && (
                <motion.div
                  key="coin-flip-video"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center mb-8"
                >
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 via-accent/30 to-primary/40 shadow-2xl border border-primary/30">
                    <div className="absolute inset-0 bg-hero-gradient opacity-60"></div>
                     <video
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      className="relative z-10 w-full h-full object-cover mix-blend-screen"
                    >
                      <source src={coinTossVideo} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 sparkles pointer-events-none"></div>
                  </div>
                  <p className="mt-4 text-base md:text-lg text-muted-foreground">Flipping coin...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transition overlay for smooth flipping -> result */}
            <AnimatePresence>
              {(phase === 'result' || phase === 'waiting') && !showPopup && (
                <motion.div
                  key="transition-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center mb-8 h-48 md:h-64"
                >
                  <div className="text-center">
                    <p className="text-base md:text-lg text-muted-foreground">
                      {phase === 'result' ? 'Preparing results...' : 'Next round starting...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Bet Status */}
            {userBet && !showPopup && phase === 'betting' && (
              <div className="mb-6 p-4 glass-card rounded-lg border border-green-500">
                <p className="text-green-400 text-center font-semibold">
                  ✅ Bet placed: {Math.floor(parseFloat(userBet.coin_amount || userBet.bet_amount))} coins on {userBet.bet_side}
                </p>
              </div>
            )}

            {/* Betting Phase */}
            {!showPopup && !flipping && (
              <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
                {!userBet && (
                  <p className="text-xl text-foreground">Place your bets!</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Players Active (Last Hour): {totalPlayers.toLocaleString()}
                </p>

                {/* Recent Results */}
                {recentResults.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">Last 5 Results:</p>
                    <div className="flex gap-2">
                      {recentResults.map((result, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            result === 'Heads' 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          }`}
                        >
                          {result === 'Heads' ? 'H' : 'T'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical Percentage Bar */}
                <div className="w-full flex flex-col gap-2">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Last 10 Results: {headsPercent}% Heads, {tailsPercent}% Tails
                  </p>
                  <div className="w-full glass-card rounded-full h-6 sm:h-8 overflow-hidden flex">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full text-black font-bold flex items-center justify-center text-xs sm:text-sm"
                      style={{ width: `${headsPercent}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${headsPercent}%` }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="hidden sm:inline">{headsPercent}% Heads</span>
                      <span className="sm:hidden">{headsPercent}%</span>
                    </motion.div>
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full text-white font-bold flex items-center justify-center text-xs sm:text-sm"
                      style={{ width: `${tailsPercent}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${tailsPercent}%` }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="hidden sm:inline">{tailsPercent}% Tails</span>
                      <span className="sm:hidden">{tailsPercent}%</span>
                    </motion.div>
                  </div>
                </div>


            {/* Betting Buttons - only show during betting phase */}
            {!userBet && phase === 'betting' && timeLeft > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full max-w-sm sm:max-w-none">
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button 
                    onClick={() => handleBetClick('Heads')}
                    disabled={!!userBet || timeLeft <= 0}
                    className={`w-full px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold shadow-lg flex items-center justify-center gap-2 ${
                      userBet || timeLeft <= 0 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black'
                    }`}
                  >
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">Bet on Heads</span>
                  </Button>
                </motion.div>
                
                <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                  <Button 
                    onClick={() => handleBetClick('Tails')}
                    disabled={!!userBet || timeLeft <= 0}
                    className={`w-full px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold shadow-lg flex items-center justify-center gap-2 ${
                      userBet || timeLeft <= 0 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">Bet on Tails</span>
                  </Button>
                </motion.div>
              </div>
            )}
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

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}

      {/* Result Popup */}
      <AnimatePresence>
        {showPopup && result && (
          <motion.div
            key="result-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center bg-background/95 z-50 p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="glass-card p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl text-center max-w-sm sm:max-w-lg mx-auto relative w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button - disabled during result phase */}
              {phase !== 'result' && (
                <button
                  onClick={handleClosePopup}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center transition-colors text-sm sm:text-base"
                >
                  ✕
                </button>
              )}

              {/* Result Header */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-4 sm:mb-6">
                Game Result
              </h2>

              {/* Coin Animation */}
              <motion.div
                className="flex justify-center mb-4 sm:mb-6"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 1 }}
              >
                <CoinFlip size="lg" className="coin-glow" />
              </motion.div>

              {/* Coin Result */}
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                It's {result}!
              </p>

              {/* Win/Loss Status */}
              {userBet && userWon !== null && (
                <div className="mb-6 sm:mb-8">
                  {userWon ? (
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 mb-2">
                        Congratulations!
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-green-300 mb-2">
                        You won {Math.floor(winAmount)} coins!
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Your bet: {Math.floor(parseFloat(userBet.coin_amount || userBet.bet_amount))} coins on {userBet.bet_side}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">😢</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 mb-2">
                        Better luck next time!
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2">
                        You lost {Math.floor(parseFloat(userBet.coin_amount || userBet.bet_amount))} coins
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Your bet: {Math.floor(parseFloat(userBet.coin_amount || userBet.bet_amount))} coins on {userBet.bet_side}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* No bet placed */}
              {!userBet && (
                <div className="mb-6 sm:mb-8 text-center">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎲</div>
                  <p className="text-base sm:text-lg md:text-xl text-gray-300">
                    You didn't place a bet this round
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Button
                  onClick={handleClosePopup}
                  variant="hero"
                  size="lg"
                  disabled={phase === 'result'}
                  className="w-full text-sm sm:text-base md:text-lg font-semibold py-2 sm:py-3"
                >
                  {phase === 'result' ? `Next Round in ${popupTimer}s` : 'Continue Playing'}
                </Button>
                
                <Button
                  onClick={handleBackToLobby}
                  variant="glass"
                  size="lg"
                  className="w-full text-sm sm:text-base md:text-lg py-2 sm:py-3"
                >
                  Back to Lobby
                </Button>
              </div>

              {/* Timer visualization */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-primary relative flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) ${(5 - popupTimer) * 72}deg, transparent 0deg)`,
                      borderRadius: '50%'
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-mono text-white">
                    {popupTimer}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-center">Next game starts automatically</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Carousel */}
      <OnboardingCarousel
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default CoinGame;