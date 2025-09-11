import React, { useState } from "react";
import { ArrowLeft, Coins, QrCode, CheckCircle, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BuyCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyCoinsModal = ({ isOpen, onClose }: BuyCoinsModalProps) => {
  const { user } = useAuth();
  const [coins, setCoins] = useState(100);
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);

  console.log('BuyCoinsModal render:', { isOpen, showQR, processing });

  const rate = 100; // 1 INR = 100 coins
  const priceINR = coins / rate;
  const presetOptions = [100, 500, 1000, 2000, 5000, 10000];

  const createPaymentTransaction = async (coins: number, inrAmount: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          coins_purchased: coins,
          amount_inr: inrAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      return null;
    }
  };

  const handlePayment = async () => {
    if (!coins || coins < 100 || !user) return;

    setProcessing(true);
    try {
      const transaction = await createPaymentTransaction(coins, priceINR);
      
      if (transaction) {
        setShowQR(true);
        toast({
          title: "Payment Initiated",
          description: `Scan QR code to pay ₹${priceINR} for ${coins} coins`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create payment transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCustomInput = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCoins(numValue);
    }
  };

  const handleClose = () => {
    setShowQR(false);
    setCoins(100);
    setProcessing(false);
    onClose();
  };

  if (showQR) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-card/95 border-primary/20 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowQR(false)}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Complete Payment
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6 text-center">
            {/* Premium QR Code Display */}
            <div className="relative w-64 h-64 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-gold">
              <div className="absolute inset-0 bg-gold-gradient opacity-10 rounded-3xl"></div>
              <div className="text-center relative z-10">
                <QrCode className="w-32 h-32 text-gray-800 mx-auto mb-4" />
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-gray-700 font-bold text-sm">Scan to Pay</p>
                  <p className="text-primary font-bold text-xl">₹{priceINR}</p>
                </div>
              </div>
              
              {/* Decorative Golden Corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-2xl opacity-60"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-2xl opacity-60"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-2xl opacity-60"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-2xl opacity-60"></div>
            </div>
            
            {/* Payment Summary */}
            <div className="space-y-4">
              <div className="p-4 bg-gold-gradient/20 rounded-2xl border border-primary/30">
                <h3 className="text-3xl font-bold text-primary drop-shadow-glow">₹{priceINR}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-gold-gradient rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <p className="text-foreground font-semibold">
                    {coins.toLocaleString()} coins
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full btn-hero text-primary-foreground font-bold py-3"
                  onClick={() => {
                    toast({
                      title: "Payment Completed! 🎉",
                      description: `${coins.toLocaleString()} coins added instantly!`,
                    });
                    handleClose();
                  }}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I&apos;ve Completed Payment
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowQR(false)}
                  className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Try Different Amount
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-card/95 border-primary/20 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Buy Coins
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-1">
              COINFLIP<span className="text-primary">X</span>
            </h1>
            <p className="text-primary text-lg font-semibold tracking-wider">PLAY & WIN BIG</p>
          </div>

          {/* Rate Display */}
          <div className="text-center mb-6">
            <p className="text-primary text-xl font-bold">1 INR = 100 Coins</p>
          </div>

          {/* Coin Packages Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-2xl mx-auto">
            {presetOptions.map((opt) => (
              <Card
                key={opt}
                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 p-4 ${
                  coins === opt 
                    ? 'bg-gold-gradient border-2 border-primary shadow-glow-gold' 
                    : 'bg-card/20 border-2 border-primary/30 hover:border-primary/50'
                } backdrop-blur-sm`}
                onClick={() => setCoins(opt)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-glow-gold ${
                    coins === opt ? 'bg-white' : 'bg-gold-gradient'
                  }`}>
                    <Coins className={`w-6 h-6 ${
                      coins === opt ? 'text-black' : 'text-primary-foreground'
                    }`} />
                  </div>
                  <div className={`text-2xl font-bold ${
                    coins === opt ? 'text-black' : 'text-white'
                  }`}>
                    {opt.toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Custom Input */}
          <div className="w-full max-w-2xl mx-auto mb-6">
            <Input
              type="number"
              min="100"
              value={coins}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="w-full text-center text-2xl py-8 bg-card/20 border-2 border-primary/30 focus:border-primary text-white placeholder:text-muted-foreground backdrop-blur-sm rounded-2xl"
              placeholder="Enter coin amount"
            />
          </div>

          {/* Payment Display */}
          <div className="text-center mb-6">
            <p className="text-white text-2xl font-semibold">
              You will pay: <span className="text-primary">₹{priceINR}</span>
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handlePayment}
              disabled={!coins || coins < 100 || processing}
              className="bg-gold-gradient hover:shadow-glow-gold text-primary-foreground font-bold py-4 px-12 text-xl rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {processing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>Pay ₹{priceINR}</span>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground text-sm">Coins added instantly</p>
            <p className="text-muted-foreground text-sm">Refund policy</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCoinsModal;