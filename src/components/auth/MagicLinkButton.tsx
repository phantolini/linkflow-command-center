
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface MagicLinkButtonProps {
  email: string;
}

export const MagicLinkButton = ({ email }: MagicLinkButtonProps) => {
  const { toast } = useToast();

  const handleMagicLink = () => {
    toast({
      title: "Magic Link",
      description: "Please use your platform's magic link authentication.",
    });
  };

  return (
    <Button
      onClick={handleMagicLink}
      variant="outline"
      className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 backdrop-blur-sm"
      disabled={!email}
    >
      <Mail className="mr-2 h-4 w-4" />
      Send Magic Link
    </Button>
  );
};
