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
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: isSignUp ? "Account created successfully!" : "Welcome back!",
        });
        onClose();
        navigate('/game');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
            {isSignUp ? 'Join CoinFlipX' : 'Welcome Back'}
          </h2>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account to start playing!' : 'Sign in to continue your game!'}
          </p>
        </div>

        {/* Sign Up/Sign In Toggle */}
        <div className="flex bg-muted/50 p-1 rounded-lg mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all text-sm font-medium ${
              !isSignUp
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all text-sm font-medium ${
              isSignUp
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 bg-input/50 border-border/50 focus:border-primary/50"
              disabled={loading}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Start Playing')}
          </Button>
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