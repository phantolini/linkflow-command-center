
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface MagicLinkButtonProps {
  email: string;
}

export const MagicLinkButton = ({ email }: MagicLinkButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    <Button
      onClick={handleMagicLink}
      disabled={loading}
      variant="outline"
      className="w-full h-12 btn-glass text-white border-white/30 hover:bg-white/10 transition-all duration-300"
    >
      <Mail className="h-5 w-5 mr-2" />
      Send Magic Link
    </Button>
  );
};
