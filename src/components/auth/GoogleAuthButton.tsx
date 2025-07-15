
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

export const GoogleAuthButton = () => {
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      console.log('Starting Google OAuth...');
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      // The redirect will happen automatically
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      let errorMessage = error.message;
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Google sign-in failed. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address first.';
      } else if (error.message?.includes('OAuth')) {
        errorMessage = 'Google authentication is not properly configured. Please contact support.';
      }
      
      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setLoading(false);
    }
  };

  return (
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
        {loading ? "Connecting..." : "Continue with Google"}
        {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
      </span>
    </Button>
  );
};
