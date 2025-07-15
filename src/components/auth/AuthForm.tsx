
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export const AuthForm = ({ isSignUp, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link to complete your registration.",
        });
      } else {
        // Attempt global sign out first
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (err) {
          // Continue even if this fails
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });

        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      let errorMessage = error.message;
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address first.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Try signing in instead.';
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="space-y-2">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-400 transition-colors" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-12 h-12 glass border-white/20 text-white placeholder:text-slate-400 focus:border-fuchsia-400/50 focus:ring-fuchsia-400/25"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-400 transition-colors" />
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-12 h-12 glass border-white/20 text-white placeholder:text-slate-400 focus:border-fuchsia-400/50 focus:ring-fuchsia-400/25"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 btn-glass-primary text-white font-semibold hover:scale-105 transition-all duration-300 group"
      >
        {loading ? (
          "Processing..."
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isSignUp ? "Create Free Account" : "Sign In"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up for free"}
        </button>
      </div>
    </form>
  );
};
