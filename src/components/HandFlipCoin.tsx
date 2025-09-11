import React, { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HandFlipCoinProps {
  trigger: boolean;
  result: string | null;
}

const HandFlipCoin: React.FC<HandFlipCoinProps> = ({ trigger, result }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (trigger && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [trigger]);

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      {/* Video Player for Coin Flip */}
      {trigger && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-80 h-80 object-cover rounded-lg"
            muted
            playsInline
          >
            {/* Video source will be added when you provide the video */}
            {/* <source src="/path-to-your-video.mp4" type="video/mp4" /> */}
          </video>
        </div>
      )}

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