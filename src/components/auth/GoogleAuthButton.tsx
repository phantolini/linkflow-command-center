
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Chrome } from "lucide-react";

export const GoogleAuthButton = () => {
  const { toast } = useToast();

  const handleGoogleAuth = () => {
    toast({
      title: "Google Sign-In",
      description: "Please use your platform's Google authentication.",
    });
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      variant="outline"
      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
    >
      <Chrome className="mr-2 h-5 w-5" />
      Continue with Google
    </Button>
  );
};
