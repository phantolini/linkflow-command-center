
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight } from "lucide-react";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        // Send custom email via our edge function
        await fetch('/functions/v1/send-auth-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            type: 'signup',
            redirectTo: `${window.location.origin}/`
          }),
        });

        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link to complete your registration.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      // Send custom magic link email via our edge function
      await fetch('/functions/v1/send-auth-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'magiclink',
          redirectTo: `${window.location.origin}/`
        }),
      });

      toast({
        title: "Check your email!",
        description: "We sent you a magic link to sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl floating-animation" style={{ animationDelay: '-6s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-card hover-lift glow-effect relative z-10">
        <CardHeader className="text-center space-y-6">
          {/* SAWD Logo */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <img 
              src="/lovable-uploads/d260a0ec-5de2-4c2b-bfee-56c85b40e602.png" 
              alt="SAWD Logo" 
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            SAWD LINK
          </CardTitle>
          <p className="text-slate-300/90 text-lg">
            {isSignUp ? "Create your digital command center" : "Welcome back to your command center"}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 glass border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-12 glass border-white/20 text-white placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-cyan-400/25"
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
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-4 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          <Button
            onClick={handleMagicLink}
            disabled={loading}
            variant="outline"
            className="w-full h-12 btn-glass text-white border-white/30 hover:bg-white/10 transition-all duration-300"
          >
            <Mail className="h-5 w-5 mr-2" />
            Send Magic Link
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
