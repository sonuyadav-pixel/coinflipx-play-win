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
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
            duration: 2000,
          });
        } else {
          toast({
            title: "Success!",
            description: "Account created! Please check your email to confirm your account.",
            duration: 2000,
          });
          onClose();
        }
      } else {
        const { data, error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
            duration: 2000,
          });
        } else {
          toast({
            title: "Success!",
            description: "Signed in successfully!",
            duration: 2000,
          });
          onClose();
          navigate('/game');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
        duration: 2000,
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
          duration: 2000,
        });
      }
      // Note: OAuth will redirect automatically, so we don't need to handle success here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
        duration: 2000,
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
      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>

        {/* Header with Coin */}
        <div className="text-center mb-6 md:mb-8">
          <CoinFlip size="md" className="mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
            {isSignUp ? 'Join CoinFlipX' : 'Welcome Back'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {isSignUp 
              ? 'Create your account to start playing!'
              : 'Sign in to continue your winning streak!'
            }
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-4 md:mb-6">
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
              className="mt-1 bg-input/50 border-border/50 focus:border-primary/50 min-h-[44px]"
              disabled={loading}
              required
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
              className="mt-1 bg-input/50 border-border/50 focus:border-primary/50 min-h-[44px]"
              disabled={loading}
              required
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full min-h-[44px]" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary underline"
              disabled={loading}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
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
            className="w-full justify-start min-h-[44px]" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome size={18} />
            <span className="ml-2">Continue with Google</span>
          </Button>
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full justify-start opacity-50 min-h-[44px]" 
            disabled
          >
            <Facebook size={18} />
            <span className="ml-2 hidden sm:inline">Facebook (Coming Soon)</span>
            <span className="ml-2 sm:hidden">Facebook</span>
          </Button>
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full justify-start opacity-50 min-h-[44px]" 
            disabled
          >
            <Apple size={18} />
            <span className="ml-2 hidden sm:inline">Apple (Coming Soon)</span>
            <span className="ml-2 sm:hidden">Apple</span>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          {isSignUp 
            ? "By creating an account, you agree to our terms and conditions" 
            : "Secure authentication with email and password"}
          <br />
          18+ Only | Play Responsibly
        </p>
      </div>
    </div>
  );
};

export default LoginModal;