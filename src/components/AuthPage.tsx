
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "./auth/AuthForm";
import { GoogleAuthButton } from "./auth/GoogleAuthButton";
import { MagicLinkButton } from "./auth/MagicLinkButton";

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black relative overflow-hidden">
      {/* Animated fluid blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 rounded-full blur-3xl blob-animation-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl blob-animation-delayed-2"></div>
        <div className="absolute top-10 right-1/3 w-64 h-64 bg-gradient-to-r from-fuchsia-400/20 to-pink-400/20 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute bottom-10 left-1/3 w-56 h-56 bg-gradient-to-r from-purple-400/25 to-fuchsia-400/25 rounded-full blur-3xl blob-animation-delayed"></div>
      </div>

      {/* Card container */}
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
            <GoogleAuthButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-slate-400 font-medium">Or continue with email</span>
              </div>
            </div>

            <AuthForm 
              isSignUp={isSignUp} 
              onToggleMode={() => setIsSignUp(!isSignUp)}
            />

            <MagicLinkButton email={email} />

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
