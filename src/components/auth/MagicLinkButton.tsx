
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { auth } from "@/services/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";
import { useState } from "react";

interface MagicLinkButtonProps {
  email: string;
}

export const MagicLinkButton = ({ email }: MagicLinkButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Store email for later verification
      localStorage.setItem('emailForSignIn', email);
      
      toast({
        title: "Magic link sent!",
        description: "Check your email for a sign-in link.",
      });
      
    } catch (error: any) {
      console.error("Magic link error:", error);
      
      let errorMessage = "Failed to send magic link.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please try again later.";
          break;
        default:
          errorMessage = error.message || "Failed to send magic link.";
      }
      
      toast({
        title: "Magic Link Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMagicLink}
      variant="outline"
      className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 backdrop-blur-sm"
      disabled={!email || loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      Send Magic Link
    </Button>
  );
};
