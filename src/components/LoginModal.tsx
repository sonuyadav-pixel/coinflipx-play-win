import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CoinFlip from './CoinFlip';
import { Mail, Phone, Facebook, Chrome, Apple } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

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
            Welcome to CoinFlipX
          </h2>
          <p className="text-muted-foreground">Start playing and win big!</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-muted/50 p-1 rounded-lg mb-6">
          <button
            onClick={() => setLoginType('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              loginType === 'email'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail size={16} />
            Email
          </button>
          <button
            onClick={() => setLoginType('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
              loginType === 'phone'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Phone size={16} />
            Phone
          </button>
        </div>

        {/* Login Form */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="login-input" className="text-sm font-medium">
              {loginType === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="login-input"
              type={loginType === 'email' ? 'email' : 'tel'}
              placeholder={
                loginType === 'email' ? 'Enter your email' : 'Enter your phone number'
              }
              className="mt-1 bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>
          
          <Button variant="hero" size="lg" className="w-full">
            Start Playing
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <Separator className="bg-border/30" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button variant="glass" size="lg" className="w-full justify-start">
            <Chrome size={18} />
            Continue with Google
          </Button>
          <Button variant="glass" size="lg" className="w-full justify-start">
            <Facebook size={18} />
            Continue with Facebook
          </Button>
          <Button variant="glass" size="lg" className="w-full justify-start">
            <Apple size={18} />
            Continue with Apple
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          18+ Only | Play Responsibly
        </p>
      </div>
    </div>
  );
};

export default LoginModal;