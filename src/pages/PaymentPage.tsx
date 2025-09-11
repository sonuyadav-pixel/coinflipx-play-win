import React, { useState } from "react";
import { ArrowLeft, Coins, QrCode, CreditCard, CheckCircle } from "lucide-react";
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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowQR(false)}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Complete Payment</h1>
          </div>

          <Card className="p-8 text-center">
            <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="text-center">
                <QrCode className="w-32 h-32 text-gray-800 mx-auto mb-4" />
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-gray-700 font-semibold">Scan to Pay</p>
                  <p className="text-primary font-bold text-lg">₹{priceINR}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl">
                <h3 className="text-3xl font-bold text-primary">₹{priceINR}</h3>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  {coins.toLocaleString()} coins
                </p>
              </div>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Payment Completed! 🎉",
                    description: `${coins.toLocaleString()} coins added to your account!`,
                  });
                  navigate(-1);
                }}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I've Completed Payment
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Different Amount
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Buy Coins</h1>
        </div>

        {/* Preset options */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {presetOptions.map((opt) => (
            <Button
              key={opt}
              onClick={() => setCoins(opt)}
              variant={coins === opt ? "default" : "outline"}
              className="h-20 text-lg font-bold flex flex-col gap-1"
            >
              <span>{opt}</span>
              <Coins className="w-5 h-5" />
            </Button>
          ))}
        </div>

        {/* Custom input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Custom Amount (Coins)</label>
          <Input
            type="number"
            min="100"
            value={coins}
            onChange={(e) => handleCustomInput(e.target.value)}
            className="text-center text-lg py-6"
            placeholder="Enter coins (minimum 100)"
          />
        </div>

        {/* Equation display */}
        <Card className="p-6 mb-6 text-center">
          <p className="text-lg mb-4">
            <span className="text-muted-foreground">1 INR = 100 Coins</span>
          </p>
          <div className="text-2xl font-bold">
            <span className="text-primary">{coins} Coins</span>
            <span className="mx-4">=</span>
            <span className="text-green-500">₹{priceINR}</span>
          </div>
        </Card>

        {/* CTA */}
        <Button
          onClick={handlePayment}
          disabled={!coins || coins < 100 || processing}
          className="w-full py-6 text-xl font-bold"
          size="lg"
        >
          {processing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>Pay ₹{priceINR}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;