import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coins, QrCode, Star, Sparkles, CreditCard, Shield, CheckCircle } from "lucide-react";
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

  // Predefined coin packages with popular tags
  const coinPackages = [
    { coins: 100, price: 1, tag: "Starter" },
    { coins: 500, price: 5, tag: "Popular", isPopular: true },
    { coins: 1000, price: 10, tag: "Value" },
    { coins: 2500, price: 25, tag: "Pro" },
    { coins: 5000, price: 50, tag: "Elite", isElite: true },
    { coins: 10000, price: 100, tag: "Ultimate" },
  ];

  const calculateINR = (coins: number): number => {
    return Math.ceil(coins / 100);
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen relative overflow-hidden"
      >
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-background"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, y: 100, x: Math.random() * window.innerWidth }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -100, 
                x: Math.random() * (window.innerWidth || 400)
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
            >
              <Sparkles className="w-4 h-4 text-primary/30" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-6 flex flex-col min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => setShowQR(false)}
              className="mr-4 hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Complete Payment
            </h1>
          </motion.div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 text-center glass-card backdrop-blur-xl border-white/20 shadow-2xl">
                <div className="mb-8">
                  {/* Enhanced QR Code Section */}
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="relative w-72 h-72 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl"></div>
                    <div className="text-center relative z-10">
                      <QrCode className="w-40 h-40 text-gray-800 mx-auto mb-4" />
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-gray-700 font-semibold">Scan to Pay</p>
                        <p className="text-primary font-bold text-lg">₹{inrAmount}</p>
                      </div>
                    </div>
                    
                    {/* Decorative corners */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <div className="bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-xl p-4">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        ₹{inrAmount}
                      </h3>
                      <p className="text-muted-foreground flex items-center justify-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        {selectedCoins.toLocaleString()} coins
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <p className="text-blue-400 font-medium">Secure Payment</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with any UPI app (PhonePe, Paytm, GPay, etc.)
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="hero" 
                      className="w-full relative overflow-hidden group"
                      onClick={() => {
                        toast({
                          title: "Payment Completed! 🎉",
                          description: `${selectedCoins.toLocaleString()} coins added to your account!`,
                        });
                        navigate(-1);
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      I've Completed Payment
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowQR(false)}
                      className="border-white/20 hover:bg-white/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Try Different Amount
                    </Button>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,215,0,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      {/* Floating coins animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              opacity: 0, 
              y: window.innerHeight + 100, 
              x: Math.random() * (window.innerWidth || 400),
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 0.6, 0], 
              y: -100, 
              x: Math.random() * (window.innerWidth || 400),
              rotate: 360
            }}
            transition={{ 
              duration: 4 + Math.random() * 3, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            <Coins className="w-6 h-6 text-primary/40" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4 hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Buy Coins
              </h1>
              <p className="text-muted-foreground mt-1">Choose your perfect coin package</p>
            </div>
          </motion.div>

          {/* Exchange Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 mb-8 glass-card backdrop-blur-xl border-white/20 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Exchange Rate</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    100 Coins = ₹1
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Coin Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Choose Your Package
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coinPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.coins}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                      selectedCoins === pkg.coins
                        ? 'ring-2 ring-primary shadow-2xl shadow-primary/25 bg-gradient-to-br from-primary/10 to-primary-glow/5'
                        : 'glass-card hover:shadow-xl hover:shadow-primary/10 backdrop-blur-xl border-white/20'
                    }`}
                    onClick={() => handlePackageSelect(pkg.coins)}
                  >
                    {/* Popular/Elite Badge */}
                    {pkg.isPopular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        POPULAR
                      </div>
                    )}
                    {pkg.isElite && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        ELITE
                      </div>
                    )}

                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    
                    <div className="text-center relative z-10">
                      <div className="mb-3">
                        <div className="inline-block p-3 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full mb-3">
                          <Coins className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                          {pkg.coins.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">{pkg.tag} Package</div>
                        <div className="text-3xl font-bold text-foreground">₹{pkg.price}</div>
                        <div className="text-xs text-muted-foreground">
                          {(pkg.coins / pkg.price).toFixed(0)} coins per ₹
                        </div>
                      </div>

                      {selectedCoins === pkg.coins && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                        >
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-background rounded-full"></div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Custom Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Custom Amount
            </h2>
            <Card className="p-6 glass-card backdrop-blur-xl border-white/20">
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter coins (minimum 100)"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min="100"
                    max="50000"
                    className="text-lg py-6 pl-12 bg-background/50 border-white/20 focus:border-primary/50"
                  />
                  <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
                
                <AnimatePresence>
                  {selectedCoins && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-xl border border-primary/20"
                    >
                      <p className="text-sm text-muted-foreground mb-2">You'll pay</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
                        ₹{calculateINR(selectedCoins)}
                      </p>
                      <p className="text-muted-foreground flex items-center justify-center gap-2">
                        <span>for</span>
                        <span className="font-semibold text-primary">{selectedCoins.toLocaleString()}</span>
                        <span>coins</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Payment Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pb-8"
          >
            <Button
              onClick={handlePayment}
              disabled={!selectedCoins || selectedCoins < 100 || processing}
              variant="hero"
              className="w-full py-6 text-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-glow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {processing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{selectedCoins ? calculateINR(selectedCoins) : 0}</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </motion.div>
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;