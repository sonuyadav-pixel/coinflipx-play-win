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
      <DialogContent className="max-w-sm sm:max-w-md bg-card/95 border-primary/20 backdrop-blur-sm mx-2">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Payment Received!
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
              size="sm"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-3 sm:p-6 text-center space-y-4 sm:space-y-6">
          {/* Success Animation */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-glow-gold animate-pulse">
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-gold-gradient/20 rounded-2xl border border-primary/30">
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">₹{amount}</h3>
              <p className="text-sm sm:text-base text-foreground font-semibold">
                {coins.toLocaleString()} coins
              </p>
            </div>

            {/* Status Message */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                <h3 className="font-semibold text-blue-400 text-sm sm:text-base">Under Review</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your payment is being reviewed by our team. Coins will be added to your account within 
                <span className="font-semibold text-primary"> 15 minutes</span> after verification.
              </p>
            </div>

            {/* Next Steps */}
            <div className="text-left space-y-2">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">What happens next?</h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span>Admin reviews your payment confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span>Coins are automatically added to your balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 sm:mt-1 flex-shrink-0">•</span>
                  <span>You'll receive a notification when complete</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gold-gradient hover:shadow-glow-gold text-primary-foreground font-bold py-3 rounded-2xl transition-all duration-300 text-sm sm:text-base"
          >
            Continue Playing
          </Button>

          {/* Support Text */}
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Need help? Contact support if you don't see your coins within 15 minutes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;