import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import CoinFlip from '@/components/CoinFlip';

interface OnboardingCarouselProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ isOpen, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      title: "Welcome to Coin Toss!",
      body: "A quick and fun game of betting on a coin flip. Let's show you how it works!",
      content: (
        <div className="flex justify-center items-center mb-8">
          <CoinFlip size="lg" className="animate-pulse" />
        </div>
      )
    },
    {
      title: "How to Play",
      body: "Choose Heads or Tails, and select the amount you want to bet.",
      content: (
        <div className="flex flex-col items-center space-y-6 mb-8">
          <div className="flex space-x-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">H</div>
              <div className="text-sm text-muted-foreground">Heads</div>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">T</div>
              <div className="text-sm text-muted-foreground">Tails</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">$10</Button>
            <Button variant="outline" size="sm">$25</Button>
            <Button variant="outline" size="sm">$50</Button>
          </div>
        </div>
      )
    },
    {
      title: "What Happens Next",
      body: "If you win → your money doubles!\n\nIf you lose → you lose your bet.",
      content: (
        <div className="flex justify-center items-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-green-500 text-3xl mb-2">🎉</div>
            <div className="text-sm font-semibold text-green-500">Win</div>
            <div className="text-xs text-muted-foreground">Money x2</div>
          </div>
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-2">💸</div>
            <div className="text-sm font-semibold text-red-500">Lose</div>
            <div className="text-xs text-muted-foreground">Bet lost</div>
          </div>
        </div>
      )
    },
    {
      title: "Play Responsibly",
      body: "This is a game of luck. Play responsibly and have fun!",
      content: (
        <div className="flex justify-center items-center mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😊</div>
            <div className="text-primary text-lg">🎯</div>
            <div className="text-sm text-muted-foreground mt-2">Play Smart</div>
          </div>
        </div>
      )
    }
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="bg-background rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-accent/20 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Slide content */}
        <div className="p-8 text-center min-h-[500px] flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {slides[currentSlide].title}
            </h1>
            
            {slides[currentSlide].content}
            
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {slides[currentSlide].body}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`p-2 rounded-full transition-colors ${
                currentSlide === 0 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:bg-accent/20'
              }`}
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </button>

            {/* Progress dots */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide 
                      ? 'bg-primary' 
                      : 'bg-muted hover:bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {/* Next button or CTA */}
            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={onComplete}
                variant="default"
                size="sm"
                className="px-6"
              >
                👉 Okay, Got it!
              </Button>
            ) : (
              <button
                onClick={nextSlide}
                className="p-2 rounded-full hover:bg-accent/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;