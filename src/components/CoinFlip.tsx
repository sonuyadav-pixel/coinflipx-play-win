import React from 'react';
import coinImage from '@/assets/golden-coin.png';

interface CoinFlipProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CoinFlip = ({ className = '', size = 'md' }: CoinFlipProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden`}>
      <img
        src={coinImage}
        alt="Golden Coin"
        className="w-full h-full object-contain coin-flip coin-glow rounded-full"
      />
      <div className="absolute inset-0 sparkles pointer-events-none"></div>
    </div>
  );
};

export default CoinFlip;