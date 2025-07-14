
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black relative overflow-hidden">
      {/* Animated fluid blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large fluid blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-full blur-3xl blob-animation-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl blob-animation-delayed-2"></div>
        <div className="absolute top-10 right-1/3 w-64 h-64 bg-gradient-to-r from-fuchsia-400/20 to-pink-400/20 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-gradient-to-r from-purple-400/25 to-fuchsia-400/25 rounded-full blur-3xl blob-animation-delayed"></div>
      </div>

      {/* Card container with enhanced backdrop */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <Card className="w-full max-w-md glass-card hover-lift glow-effect relative z-10 border-fuchsia-500/20">
          <CardHeader className="text-center space-y-6">
            {/* SAWD Logo */}
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <img 
                src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" 
                alt="SAWD Logo" 
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              SAWD LINK
            </CardTitle>
            <p className="text-slate-200/90 text-lg font-medium">
              {isSignUp ? "Create your digital command center" : "Welcome back to your command center"}
            </p>
            <p className="text-fuchsia-300/80 text-sm font-semibold">
              ✨ Always Free • No Credit Card Required
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign-In Button - Primary CTA */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-12 btn-glass-primary text-white font-semibold hover:scale-105 transition-all duration-300 group bg-gradient-to-r from-fuchsia-500/80 to-pink-500/80 hover:from-fuchsia-500 hover:to-pink-500"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="flex items-center justify-center gap-2">
                Continue with Google
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-slate-400 font-medium">Or continue with email</span>
              </div>
            </div>

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
            </form>

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
                className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up for free"}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
