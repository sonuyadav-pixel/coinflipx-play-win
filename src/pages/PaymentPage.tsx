import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, QrCode } from "lucide-react";
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
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Predefined coin packages
  const coinPackages = [
    { coins: 100, price: 1 },
    { coins: 500, price: 5 },
    { coins: 1000, price: 10 },
    { coins: 2500, price: 25 },
    { coins: 5000, price: 50 },
    { coins: 10000, price: 100 },
  ];

  const calculateINR = (coins: number): number => {
    return Math.ceil(coins / 100); // 1 INR = 100 coins
  };

  const handlePackageSelect = (coins: number) => {
    setSelectedCoins(coins);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    if (value && !isNaN(Number(value))) {
      setSelectedCoins(Number(value));
    } else {
      setSelectedCoins(null);
    }
  };

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
    if (!selectedCoins || !user) return;

    setProcessing(true);
    try {
      const inrAmount = calculateINR(selectedCoins);
      const transaction = await createPaymentTransaction(selectedCoins, inrAmount);
      
      if (transaction) {
        setShowQR(true);
        toast({
          title: "Payment Initiated",
          description: `Scan QR code to pay ₹${inrAmount} for ${selectedCoins} coins`,
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

  if (showQR && selectedCoins) {
    const inrAmount = calculateINR(selectedCoins);
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-background"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.02%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative z-10 p-6 flex flex-col min-h-screen">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowQR(false)}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Payment QR Code</h1>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="p-8 text-center glass-card">
              <div className="mb-6">
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-center">
                    <QrCode className="w-32 h-32 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">QR Code</p>
                    <p className="text-gray-500 text-xs">Scan to pay ₹{inrAmount}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-primary">₹{inrAmount}</h3>
                  <p className="text-muted-foreground">
                    for {selectedCoins.toLocaleString()} coins
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your UPI app to complete the payment
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Payment Completed",
                        description: `${selectedCoins} coins added to your account!`,
                      });
                      navigate(-1);
                    }}
                  >
                    I've Completed Payment
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQR(false)}
                  >
                    Try Different Amount
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-background"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.02%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
            Buy Coins
          </h1>
        </div>

        <Card className="p-4 mb-6 glass-card">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Exchange Rate:</span>
            <span className="font-bold">100 Coins = ₹1</span>
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Choose Package</h2>
          <div className="grid grid-cols-2 gap-3">
            {coinPackages.map((pkg) => (
              <motion.div
                key={pkg.coins}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    selectedCoins === pkg.coins
                      ? 'ring-2 ring-primary bg-primary/10'
                      : 'glass-card hover:bg-muted/5'
                  }`}
                  onClick={() => handlePackageSelect(pkg.coins)}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary mb-1">
                      {pkg.coins.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">coins</div>
                    <div className="text-lg font-bold">₹{pkg.price}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Custom Amount</h2>
          <Card className="p-4 glass-card">
            <div className="space-y-4">
              <div>
                <Input
                  type="number"
                  placeholder="Enter coins (min 100)"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  min="100"
                  max="50000"
                />
              </div>
              {selectedCoins && (
                <div className="text-center p-3 bg-muted/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">You'll pay</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{calculateINR(selectedCoins)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    for {selectedCoins.toLocaleString()} coins
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-auto">
          <Button
            onClick={handlePayment}
            disabled={!selectedCoins || selectedCoins < 100 || processing}
            variant="hero"
            className="w-full py-4 text-lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Pay ₹${selectedCoins ? calculateINR(selectedCoins) : 0}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;