import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoinFlip from "@/components/CoinFlip";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Coin Toss!",
      content: "A quick and fun game of betting on a coin flip. Let's show you how it works!",
      visual: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 animate-pulse"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <CoinFlip size="lg" />
          </div>
          <div className="absolute inset-0 sparkles pointer-events-none"></div>
        </div>
      )
    },
    {
      title: "How to Play",
      content: "Choose Heads or Tails, and select the amount you want to bet.",
      visual: (
        <div className="flex flex-col items-center space-y-4 mb-6">
          {/* Heads/Tails Toggle */}
          <div className="flex gap-4">
            <div className="glass-card p-4 rounded-lg border border-primary/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold-gradient mb-2 mx-auto flex items-center justify-center">
                  <span className="font-bold text-lg">H</span>
                </div>
                <p className="text-sm">Heads</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-lg border border-muted/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted mb-2 mx-auto flex items-center justify-center">
                  <span className="font-bold text-lg">T</span>
                </div>
                <p className="text-sm">Tails</p>
              </div>
            </div>
          </div>
          {/* Bet Amount */}
          <div className="glass-card p-3 rounded-lg border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">Bet Amount: 100 coins</p>
          </div>
        </div>
      )
    },
    {
      title: "What Happens Next",
      content: "If you win → your money doubles!\nIf you lose → you lose your bet.",
      visual: (
        <div className="flex justify-center items-center space-x-8 mb-6">
          {/* Win Side */}
          <div className="text-center">
            <div className="relative">
              <motion.div 
                className="w-12 h-12 rounded-full bg-gold-gradient mb-2 mx-auto flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              >
                <span className="text-sm font-bold">100</span>
              </motion.div>
              <motion.div 
                className="w-12 h-12 rounded-full bg-gold-gradient absolute -top-2 -right-2 flex items-center justify-center"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
              >
                <span className="text-sm font-bold">100</span>
              </motion.div>
            </div>
            <p className="text-xs text-green-400">WIN: 200 coins</p>
          </div>
          
          {/* VS */}
          <div className="text-muted-foreground text-sm">VS</div>
          
          {/* Lose Side */}
          <div className="text-center">
            <motion.div 
              className="w-12 h-12 rounded-full bg-muted mb-2 mx-auto flex items-center justify-center"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <span className="text-sm font-bold">100</span>
            </motion.div>
            <p className="text-xs text-destructive">LOSE: 0 coins</p>
          </div>
        </div>
      )
    },
    {
      title: "Play Responsibly",
      content: "This is a game of luck. Play responsibly and have fun!",
      visual: (
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center mx-auto">
              <span className="text-2xl">😊</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs">✓</span>
            </div>
          </div>
          <div className="glass-card p-2 rounded-lg border border-primary/20">
            <p className="text-sm text-center text-primary">Play Smart</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed
    localStorage.setItem('coinflip_onboarding_shown', 'true');
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-primary/30">
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center min-h-[300px] flex flex-col justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-4">
                {slides[currentSlide].title}
              </h1>
              
              {slides[currentSlide].visual}
              
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {slides[currentSlide].content}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="opacity-70 hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              {currentSlide === slides.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={handleComplete}
                  className="px-6"
                >
                  👉 Okay, Got it!
                </Button>
              ) : (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={nextSlide}
                  className="opacity-70 hover:opacity-100"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe Instructions */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Swipe or use arrows to navigate
        </p>
      </div>

      {/* Touch/Swipe Handlers - Only on slide content area */}
      <div
        className="absolute inset-0 pointer-events-none"
        onTouchStart={(e) => {
          // Only handle swipes on the slide content, not buttons
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
          
          const touchStart = e.touches[0].clientX;
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const touchEnd = endEvent.changedTouches[0].clientX;
            const diff = touchStart - touchEnd;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0 && currentSlide < slides.length - 1) {
                nextSlide();
              } else if (diff < 0 && currentSlide > 0) {
                prevSlide();
              }
            }
            
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd);
        }}
        style={{ pointerEvents: 'auto' }}
      />
    </motion.div>
  );
};

export default OnboardingCarousel;