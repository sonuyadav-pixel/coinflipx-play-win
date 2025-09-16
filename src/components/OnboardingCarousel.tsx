import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Smile } from "lucide-react";
import CoinFlip from "@/components/CoinFlip";

interface OnboardingCarouselProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Welcome to Coin Toss!",
    body: "A quick and fun game of betting on a coin flip. Let's show you how it works!",
    visual: "animated-coin",
    showCTA: false
  },
  {
    title: "How to Play",
    body: "Choose Heads or Tails, and select the amount you want to bet.",
    visual: "bet-interface",
    showCTA: false
  },
  {
    title: "What Happens Next",
    body: "If you win → your money doubles!\nIf you lose → you lose your bet.",
    visual: "win-lose",
    showCTA: false
  },
  {
    title: "Play Responsibly",
    body: "This is a game of luck. Play responsibly and have fun!",
    visual: "play-smart",
    showCTA: true
  }
];

const OnboardingCarousel = ({ onComplete }: OnboardingCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  const renderVisual = (visual: string) => {
    switch (visual) {
      case "animated-coin":
        return (
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
            <CoinFlip size="lg" className="coin-flip animate-bounce" />
          </div>
        );
      
      case "bet-interface":
        return (
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="glass-card p-4 rounded-lg border-2 border-primary/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gold-gradient rounded-full mx-auto mb-2 flex items-center justify-center text-background font-bold">H</div>
                  <span className="text-sm text-muted-foreground">Heads</span>
                </div>
              </div>
              <div className="glass-card p-4 rounded-lg border-2 border-muted/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center text-muted-foreground font-bold">T</div>
                  <span className="text-sm text-muted-foreground">Tails</span>
                </div>
              </div>
            </div>
            <div className="glass-card px-4 py-2 rounded-lg">
              <span className="text-primary font-semibold">Bet: 100 coins</span>
            </div>
          </div>
        );
      
      case "win-lose":
        return (
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">💰</span>
              </motion.div>
              <span className="text-sm text-green-400 font-semibold">Win: x2</span>
            </div>
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">💸</span>
              </motion.div>
              <span className="text-sm text-red-400 font-semibold">Lose: -bet</span>
            </div>
          </div>
        );
      
      case "play-smart":
        return (
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              <Smile className="w-16 h-16 text-primary" />
            </motion.div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg">
      <div 
        className="w-full max-w-md mx-4 glass-card rounded-2xl p-6 md:p-8 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentSlide ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Visual */}
            {renderVisual(slides[currentSlide].visual)}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-4">
              {slides[currentSlide].title}
            </h1>

            {/* Body */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 whitespace-pre-line">
              {slides[currentSlide].body}
            </p>

            {/* CTA */}
            {slides[currentSlide].showCTA && (
              <Button
                onClick={onComplete}
                className="w-full bg-gold-gradient hover:scale-105 transition-transform duration-200 text-background font-bold py-3 text-lg"
                size="lg"
              >
                👉 Okay, Got it!
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {!slides[currentSlide].showCTA && (
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="ghost"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="px-6 py-2 bg-primary/20 hover:bg-primary/30 transition-colors"
            >
              <span className="mr-2">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingCarousel;