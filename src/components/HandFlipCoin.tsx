import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HandFlipCoinProps {
  trigger: boolean;
  result: string | null;
}

const HandFlipCoin: React.FC<HandFlipCoinProps> = ({ trigger, result }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      {/* 3D Coin Animation */}
      <motion.div
        className="relative w-40 h-40"
        animate={
          trigger
            ? { rotateY: 1800, scale: [1, 1.3, 1.6] } // spin + grow
            : { rotateY: 0, scale: 1 }
        }
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* HEADS Face */}
        <div
          className="absolute w-40 h-40 rounded-full shadow-2xl border-4 border-yellow-500 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, #FFD700 10%, #DAA520 80%)",
            backfaceVisibility: "hidden",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-24 h-24"
          >
            <circle cx="50" cy="50" r="45" fill="url(#grad1)" stroke="#b8860b" strokeWidth="4" />
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              fontSize="28"
              fill="#b8860b"
              fontWeight="bold"
              style={{ filter: "drop-shadow(1px 1px 1px #000)" }}
            >
              HEADS
            </text>
            <defs>
              <radialGradient id="grad1">
                <stop offset="0%" stopColor="#fff9c4" />
                <stop offset="100%" stopColor="#ffcc00" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* TAILS Face */}
        <div
          className="absolute w-40 h-40 rounded-full shadow-2xl border-4 border-yellow-500 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, #FFD700 10%, #DAA520 80%)",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-24 h-24"
          >
            <circle cx="50" cy="50" r="45" fill="url(#grad2)" stroke="#b8860b" strokeWidth="4" />
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              fontSize="28"
              fill="#b8860b"
              fontWeight="bold"
              style={{ filter: "drop-shadow(1px 1px 1px #000)" }}
            >
              TAILS
            </text>
            <defs>
              <radialGradient id="grad2">
                <stop offset="0%" stopColor="#fff9c4" />
                <stop offset="100%" stopColor="#ffcc00" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 text-center"
          >
            <div className="text-4xl font-bold text-primary mb-2">
              {result === "Heads" ? "🟡 Heads!" : "🔵 Tails!"}
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