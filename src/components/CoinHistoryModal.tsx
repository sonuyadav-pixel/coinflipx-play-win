import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Gift, Coins, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeCoins } from '@/hooks/useRealtimeCoins';

interface Transaction {
  id: string;
  type: 'win' | 'loss' | 'bonus' | 'purchase_pending' | 'purchase_completed' | 'purchase_rejected';
  amount: number;
  description: string;
  bet_side?: string;
  result?: string;
  created_at: string;
  ended_at?: string;
  category?: string;
  status?: string;
  amount_inr?: number;
}

interface CoinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins?: any; // Made optional since we can use real-time hook
  onAddCoins: () => void;
}

const CoinHistoryModal: React.FC<CoinHistoryModalProps> = ({
  isOpen,
  onClose,
  userCoins: propUserCoins, // Rename to avoid conflict
  onAddCoins
}) => {
  const { user } = useAuth();
  const { userCoins: realtimeUserCoins } = useRealtimeCoins(); // Use real-time hook
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use prop userCoins if provided, otherwise use real-time hook
  const userCoins = propUserCoins || realtimeUserCoins;

  useEffect(() => {
    if (isOpen && user) {
      fetchTransactions();
    }
  }, [isOpen, user]);

  // Listen for coin updates and payment status changes
  useEffect(() => {
    const handleCoinsUpdated = () => {
      if (isOpen) {
        console.log('Coins updated, refreshing transactions...');
        fetchTransactions();
      }
    };

    const handlePaymentApproved = () => {
      if (isOpen) {
        console.log('Payment approved, refreshing transactions...');
        fetchTransactions();
      }
    };

    const handlePaymentRejected = () => {
      if (isOpen) {
        console.log('Payment rejected, refreshing transactions...');
        fetchTransactions();
      }
    };

    window.addEventListener('coinsUpdated', handleCoinsUpdated);
    window.addEventListener('paymentApproved', handlePaymentApproved);
    window.addEventListener('paymentRejected', handlePaymentRejected);
    
    return () => {
      window.removeEventListener('coinsUpdated', handleCoinsUpdated);
      window.removeEventListener('paymentApproved', handlePaymentApproved);
      window.removeEventListener('paymentRejected', handlePaymentRejected);
    };
  }, [isOpen]);

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching coin transactions...');
      
      const { data, error } = await supabase.functions.invoke('get-coin-transactions');

      console.log('Coin transactions response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        return;
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'loss':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-yellow-400" />;
      case 'purchase_pending':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'purchase_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'purchase_rejected':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Coins className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'bonus' || type === 'purchase_completed' || amount > 0) return 'text-green-400';
    if (type === 'purchase_pending') return 'text-orange-400';
    if (type === 'purchase_rejected') return 'text-gray-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-6 rounded-3xl shadow-2xl text-center max-w-lg mx-4 relative w-full max-h-[80vh] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
            Coin History
          </h2>
          
          {userCoins && (
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="text-xs">Current Balance</p>
                <p className="text-lg font-bold text-primary">{Math.floor(userCoins.balance).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs">Total Earned</p>
                <p className="text-lg font-bold text-green-400">{Math.floor(userCoins.total_earned).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs">Total Spent</p>
                <p className="text-lg font-bold text-red-400">{Math.floor(userCoins.total_spent).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mb-4">
          <Button
            onClick={fetchTransactions}
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh History'}
          </Button>
        </div>

        {/* Add Coins Button */}
        <div className="mb-6">
          <Button
            onClick={onAddCoins}
            variant="hero"
            className="w-full"
          >
            <Coins className="w-4 h-4 mr-2" />
            Add More Coins
          </Button>
        </div>

        {/* Transactions List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Start playing to see your coin history!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getAmountColor(transaction.type, transaction.amount)}`}>
                      {transaction.type === 'purchase_pending' ? 'Pending' :
                       transaction.type === 'purchase_rejected' ? 'Rejected' :
                       transaction.amount > 0 ? '+' : ''}{transaction.amount !== 0 ? Math.floor(transaction.amount).toLocaleString() : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.type === 'purchase_pending' ? 'Under Review' :
                       transaction.type === 'purchase_rejected' ? 'Payment Failed' : 'coins'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CoinHistoryModal;