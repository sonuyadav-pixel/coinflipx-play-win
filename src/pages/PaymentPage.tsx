import React, { useState } from "react";
import { ArrowLeft, Coins, QrCode, CreditCard, CheckCircle, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coins, setCoins] = useState(100);
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  if (showQR) {
    return (
      <div className="min-h-screen bg-hero-gradient text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 sparkles opacity-30"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowQR(false)}
              className="mr-4 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Complete Payment
              </h1>
            </div>
          </div>

          <Card className="glass-card p-8 text-center border-primary/20">
            {/* Premium QR Code Display */}
            <div className="relative w-72 h-72 bg-gradient-to-br from-white to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-gold">
              <div className="absolute inset-0 bg-gold-gradient opacity-10 rounded-3xl"></div>
              <div className="text-center relative z-10">
                <QrCode className="w-40 h-40 text-gray-800 mx-auto mb-4" />
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3">
                  <p className="text-gray-700 font-bold text-sm">Scan to Pay</p>
                  <p className="text-primary font-bold text-2xl">₹{priceINR}</p>
                </div>
              </div>
              
              {/* Decorative Golden Corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-2xl opacity-60"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-2xl opacity-60"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-2xl opacity-60"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-2xl opacity-60"></div>
            </div>
            
            {/* Payment Summary */}
            <div className="space-y-6">
              <div className="p-6 bg-gold-gradient/20 rounded-2xl border border-primary/30">
                <h3 className="text-4xl font-bold text-primary drop-shadow-glow">₹{priceINR}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className="text-foreground font-semibold text-lg">
                    {coins.toLocaleString()} coins
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full btn-hero text-primary-foreground font-bold py-4 text-lg"
                  onClick={() => {
                    toast({
                      title: "Payment Completed! 🎉",
                      description: `${coins.toLocaleString()} coins added instantly!`,
                    });
                    navigate(-1);
                  }}
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
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
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient text-foreground relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 sparkles opacity-20"></div>
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center shadow-glow-gold">
                <Crown className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  CoinFlipX
                </h1>
                <p className="text-primary/80 text-sm font-medium">Play & Win Big</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent drop-shadow-lg">
            Buy Coins
          </h2>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gold-gradient/20 rounded-full border border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <p className="text-xl font-bold text-primary">1 INR = 100 Coins</p>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Preset Coin Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {presetOptions.map((opt) => (
            <Card
              key={opt}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                coins === opt 
                  ? 'glass-card border-primary shadow-glow-gold' 
                  : 'glass-card border-primary/20 hover:border-primary/40'
              }`}
              onClick={() => setCoins(opt)}
            >
              <div className="p-6 text-center">
                {/* Golden Coin Icon */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                  coins === opt ? 'bg-gold-gradient shadow-glow-gold coin-glow' : 'bg-gold-gradient/70'
                }`}>
                  <Coins className="w-8 h-8 text-primary-foreground" />
                </div>
                
                {/* Coin Amount */}
                <div className="text-2xl font-bold text-primary mb-1">
                  {opt.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Coins</div>
                
                {/* Selection Indicator */}
                {coins === opt && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-glow-blue">
                    <CheckCircle className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Input Section */}
        <Card className="glass-card border-primary/20 p-6 mb-8">
          <div className="space-y-4">
            <label className="block text-lg font-bold text-primary text-center">
              Custom Amount
            </label>
            <div className="relative">
              <Input
                type="number"
                min="100"
                value={coins}
                onChange={(e) => handleCustomInput(e.target.value)}
                className="text-center text-xl py-4 bg-card/50 border-primary/30 focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                placeholder="Enter coins, minimum 100"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </Card>

        {/* Calculated Price Display */}
        <div className="text-center mb-8">
          <Card className="glass-card border-secondary/30 p-8 bg-gradient-to-r from-secondary/10 to-primary/10">
            <p className="text-lg text-muted-foreground mb-2">You will pay:</p>
            <div className="text-6xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent drop-shadow-lg mb-2">
              ₹{priceINR}
            </div>
            <div className="flex items-center justify-center gap-2 text-foreground">
              <span className="text-lg">for</span>
              <span className="text-xl font-bold text-primary">{coins.toLocaleString()}</span>
              <span className="text-lg">coins</span>
            </div>
          </Card>
        </div>

        {/* Premium CTA Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handlePayment}
            disabled={!coins || coins < 100 || processing}
            className="btn-hero text-primary-foreground font-bold py-6 px-12 text-2xl rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <span>Pay ₹{priceINR}</span>
                <Sparkles className="w-6 h-6" />
              </div>
            )}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Coins added instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Secure payment</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;