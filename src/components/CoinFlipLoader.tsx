import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CoinFlipLoaderProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

const CoinFlipLoader = ({ 
  message = "Preparing...", 
  onComplete, 
  duration = 1500 
}: CoinFlipLoaderProps) => {
  const [currentSide, setCurrentSide] = useState<'heads' | 'tails'>('heads');

  useEffect(() => {
    const flipInterval = setInterval(() => {
      setCurrentSide(prev => prev === 'heads' ? 'tails' : 'heads');
    }, 150); // Fast flip animation

    const completeTimeout = setTimeout(() => {
      clearInterval(flipInterval);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(flipInterval);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Coin Flip Animation */}
      <div className="relative mb-6">
        <motion.div
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full relative overflow-hidden shadow-2xl"
          animate={{ 
            rotateY: [0, 180, 360, 540, 720],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{
            background: currentSide === 'heads' 
              ? 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)'
              : 'linear-gradient(135deg, #C0C0C0, #A0A0A0, #808080)'
          }}
        >
          {/* Heads Side */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-black font-bold text-lg sm:text-2xl"
            animate={{ 
              opacity: currentSide === 'heads' ? 1 : 0,
              rotateY: currentSide === 'heads' ? 0 : 180
            }}
            transition={{ duration: 0.1 }}
          >
            H
          </motion.div>
          
          {/* Tails Side */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg sm:text-2xl"
            animate={{ 
              opacity: currentSide === 'tails' ? 1 : 0,
              rotateY: currentSide === 'tails' ? 0 : 180
            }}
            transition={{ duration: 0.1 }}
          >
            T
          </motion.div>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${15 + (i * 10)}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full opacity-50">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: currentSide === 'heads'
                  ? 'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle at center, rgba(192, 192, 192, 0.4) 0%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Rotating Ring */}
        <motion.div
          className="absolute -inset-4 border-2 border-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Loading Message */}
      <motion.p
        className="text-base sm:text-lg text-muted-foreground font-medium"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {message}
      </motion.p>

      {/* Loading Dots */}
      <div className="flex gap-1 mt-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CoinFlipLoader;