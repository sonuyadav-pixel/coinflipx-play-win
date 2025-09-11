import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CoinFlip from './CoinFlip';
import { Mail, Phone, Facebook, Chrome, Apple } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [codeSent, setCodeSent] = useState(false);
  
  const { sendVerificationCode, verifyCode, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'email') {
      if (!email) {
        toast({
          title: "Error",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await sendVerificationCode(email);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Code Sent!",
            description: "Check your email for the verification code",
          });
          setStep('code');
          setCodeSent(true);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send verification code",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      if (!verificationCode) {
        toast({
          title: "Error",
          description: "Please enter the verification code",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      try {
        const { data, error } = await verifyCode(email, verificationCode);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success!",
            description: "Email verified successfully! Welcome!",
          });
          onClose();
          navigate('/game');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to verify code",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setVerificationCode('');
    setCodeSent(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await sendVerificationCode(email);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Resent!",
          description: "Check your email for the new verification code",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      // Note: OAuth will redirect automatically, so we don't need to handle success here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>

        {/* Header with Coin */}
        <div className="text-center mb-8">
          <CoinFlip size="md" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
            {step === 'email' ? 'Join CoinFlipX' : 'Verify Your Email'}
          </h2>
          <p className="text-muted-foreground">
            {step === 'email' 
              ? 'Enter your email to get started with secure, passwordless login!'
              : `We sent a 6-digit code to ${email}`
            }
          </p>
        </div>

        {/* Email/Code Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {step === 'email' ? (
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1 bg-input/50 border-border/50 focus:border-primary/50"
                disabled={loading}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="mt-1 bg-input/50 border-border/50 focus:border-primary/50 text-center text-lg tracking-widest"
                disabled={loading}
                maxLength={6}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (step === 'email' ? 'Send Verification Code' : 'Verify & Sign In')}
          </Button>

          {step === 'code' && (
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full" 
                onClick={handleBackToEmail}
                disabled={loading}
              >
                ← Back to Email
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <Separator className="bg-border/30" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full justify-start" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome size={18} />
            Continue with Google
          </Button>
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full justify-start opacity-50" 
            disabled
          >
            <Facebook size={18} />
            Facebook (Coming Soon)
          </Button>
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full justify-start opacity-50" 
            disabled
          >
            <Apple size={18} />
            Apple (Coming Soon)
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          {step === 'email' 
            ? "Secure, passwordless authentication powered by email verification" 
            : "Didn't receive the code? Check your spam folder or click resend"}
          <br />
          18+ Only | Play Responsibly
        </p>
      </div>
    </div>
  );
};

export default LoginModal;