import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HandFlipCoinProps {
  trigger: boolean;
  result: string | null;
}

const HandFlipCoin: React.FC<HandFlipCoinProps> = ({ trigger, result }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <AnimatePresence>
        {trigger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Hand Animation */}
            <motion.div
              animate={
                trigger
                  ? {
                      y: [0, -100, 0],
                      rotate: [0, 15, -15, 0],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
              className="text-6xl mb-4"
            >
              ✋
            </motion.div>

            {/* Coin Animation */}
            <motion.div
              animate={
                trigger
                  ? {
                      y: [0, -200, -100, 0],
                      rotateY: [0, 720, 1440, 2160],
                      scale: [1, 1.2, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1],
              }}
              className="absolute top-12 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-4 border-yellow-300 shadow-lg flex items-center justify-center text-xs font-bold text-yellow-900">
                {result ? (result === "Heads" ? "H" : "T") : "?"}
              </div>
            </motion.div>

            {/* Sparkle Effects */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (i % 2 ? 1 : -1) * 50],
                      y: [0, -30],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${(i * 60) - 150}px`,
                      top: `${(i % 3) * 20}px`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-16 text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">
              {result}!
            </div>
            <div className="text-muted-foreground">
              The coin landed on {result.toLowerCase()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HandFlipCoin;