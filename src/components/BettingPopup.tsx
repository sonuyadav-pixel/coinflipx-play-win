import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, CircleDollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface BettingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (amount: number) => void;
  betSide: 'Heads' | 'Tails';
  isPlacing: boolean;
}

const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export default function BettingPopup({ 
  isOpen, 
  onClose, 
  onPlaceBet, 
  betSide, 
  isPlacing 
}: BettingPopupProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setSelectedAmount(numericValue);
    } else {
      setSelectedAmount(null);
    }
    setCustomAmount(value);
  };

  const handlePlaceBet = () => {
    if (selectedAmount && selectedAmount > 0) {
      onPlaceBet(selectedAmount);
    }
  };

  const buttonColor = betSide === 'Heads' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600';
  const borderColor = betSide === 'Heads' ? 'border-yellow-500' : 'border-blue-500';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`bg-gray-900 border-2 ${borderColor} rounded-2xl p-8 max-w-md w-full mx-4 relative`}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-gray-800"
          disabled={isPlacing}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Place Your Bet
          </h2>
          <p className="text-lg text-gray-300">
            Betting on: <span className={`font-bold ${betSide === 'Heads' ? 'text-yellow-400' : 'text-blue-400'}`}>
              {betSide}
            </span>
          </p>
        </div>

        {/* Preset Amounts */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Select Amount:</h3>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                variant={selectedAmount === amount ? "default" : "outline"}
                size="sm"
                className={`text-xs ${
                  selectedAmount === amount 
                    ? buttonColor + " text-white" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
                disabled={isPlacing}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Or enter custom amount:</h3>
          <Input
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            min="0.01"
            step="0.01"
            disabled={isPlacing}
          />
        </div>

        {/* Selected Amount Display */}
        {selectedAmount && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <div className="text-center">
              <p className="text-gray-300 text-sm">Betting Amount:</p>
              <p className="text-2xl font-bold text-white">${selectedAmount}</p>
              <p className="text-sm text-gray-400">on {betSide}</p>
              
              {/* Potential Winnings */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-green-400 text-sm font-semibold">Potential Winnings:</p>
                <p className="text-xl font-bold text-green-400">${(selectedAmount * 2).toFixed(2)}</p>
                <p className="text-xs text-gray-500">Win 2X your bet amount!</p>
              </div>
            </div>
          </div>
        )}

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBet}
          disabled={!selectedAmount || selectedAmount <= 0 || isPlacing}
          className={`w-full py-3 text-lg font-bold ${buttonColor} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <CircleDollarSign className="w-5 h-5 mr-2" />
          {isPlacing ? "Placing Bet..." : `Place Bet - $${selectedAmount || 0}`}
        </Button>
      </motion.div>
    </div>
  );
}