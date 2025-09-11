import React from "react";
import { CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  amount: number;
}

const PaymentConfirmationModal = ({ isOpen, onClose, coins, amount }: PaymentConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card/95 border-primary/20 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Payment Received!
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 text-center space-y-6">
          {/* Success Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-glow-gold animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="p-4 bg-gold-gradient/20 rounded-2xl border border-primary/30">
              <h3 className="text-2xl font-bold text-primary mb-2">₹{amount}</h3>
              <p className="text-foreground font-semibold">
                {coins.toLocaleString()} coins
              </p>
            </div>

            {/* Status Message */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-blue-400">Under Review</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your payment is being reviewed by our team. Coins will be added to your account within 
                <span className="font-semibold text-primary"> 15 minutes</span> after verification.
              </p>
            </div>

            {/* Next Steps */}
            <div className="text-left space-y-2">
              <h4 className="font-semibold text-foreground">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Admin reviews your payment confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Coins are automatically added to your balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You'll receive a notification when complete</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gold-gradient hover:shadow-glow-gold text-primary-foreground font-bold py-3 rounded-2xl transition-all duration-300"
          >
            Continue Playing
          </Button>

          {/* Support Text */}
          <p className="text-xs text-muted-foreground">
            Need help? Contact support if you don't see your coins within 15 minutes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;