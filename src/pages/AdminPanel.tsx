import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [coinAmount, setCoinAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentActions, setRecentActions] = useState<Array<{
    id: string;
    email: string;
    amount: number;
    timestamp: string;
    status: 'success' | 'error';
    message: string;
  }>>([]);

  const handleAddCoins = async () => {
    if (!email || !coinAmount) {
      toast({
        title: "Error",
        description: "Please enter both email and coin amount",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(coinAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Coin amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-coins', {
        body: { email, coinAmount: amount }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Add to recent actions
      const newAction = {
        id: Date.now().toString(),
        email,
        amount,
        timestamp: new Date().toLocaleString(),
        status: 'success' as const,
        message: data.message || 'Coins added successfully'
      };
      
      setRecentActions(prev => [newAction, ...prev.slice(0, 4)]);
      
      toast({
        title: "Success",
        description: `Added ${amount} coins to ${email}`,
      });

      // Clear form
      setEmail("");
      setCoinAmount("");
      
    } catch (error: any) {
      console.error('Error adding coins:', error);
      
      // Add to recent actions
      const newAction = {
        id: Date.now().toString(),
        email,
        amount,
        timestamp: new Date().toLocaleString(),
        status: 'error' as const,
        message: error.message || 'Failed to add coins'
      };
      
      setRecentActions(prev => [newAction, ...prev.slice(0, 4)]);
      
      toast({
        title: "Error",
        description: error.message || "Failed to add coins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-background"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.02%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative z-10 p-6 flex flex-col min-h-screen max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage user coins and account balances
          </p>
        </div>

        {/* Add Coins Section */}
        <Card className="p-6 mb-8 glass-card">
          <div className="flex items-center gap-2 mb-6">
            <UserPlus className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Add Coins to User Account</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coinAmount">Coin Amount</Label>
              <Input
                id="coinAmount"
                type="number"
                placeholder="Enter coin amount"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <Button
            onClick={handleAddCoins}
            disabled={loading || !email || !coinAmount}
            className="w-full md:w-auto"
            variant="hero"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding Coins...
              </div>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Add Coins
              </>
            )}
          </Button>
        </Card>

        {/* Recent Actions */}
        {recentActions.length > 0 && (
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Recent Actions</h2>
            <div className="space-y-3">
              {recentActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    action.status === 'success' 
                      ? 'bg-green-500/10 border-green-500' 
                      : 'bg-red-500/10 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {action.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {action.status === 'success' ? 'Successfully added' : 'Failed to add'} {action.amount.toLocaleString()} coins
                        </p>
                        <p className="text-sm text-muted-foreground">
                          to {action.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {action.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 mt-8 glass-card">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Enter the user's email address exactly as they registered</p>
            <p>• Specify the number of coins to add to their account</p>
            <p>• The system will automatically update their balance and earned total</p>
            <p>• Users can check their balance in the coin history modal</p>
            <p>• Exchange rate: 100 coins = ₹1</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;