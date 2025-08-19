
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Chrome, Loader2 } from "lucide-react";
import { auth } from "@/services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";

export const GoogleAuthButton = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      console.log("Google auth successful:", result.user.uid);
      
      toast({
        title: "Welcome!",
        description: "You've been signed in with Google successfully.",
      });
      
    } catch (error: any) {
      console.error("Google auth error:", error);
      
      let errorMessage = "Failed to sign in with Google.";
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled.";
          break;
        case 'auth/popup-blocked':
          errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign-in was cancelled.";
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = "An account with this email already exists with different credentials.";
          break;
        default:
          errorMessage = error.message || "Failed to sign in with Google.";
      }
      
      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      variant="outline"
      disabled={loading}
      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Chrome className="mr-2 h-5 w-5" />
      )}
      Continue with Google
    </Button>
  );
};
