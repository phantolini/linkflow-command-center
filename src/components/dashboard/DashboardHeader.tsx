
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { Profile } from "@/services/api";

interface DashboardHeaderProps {
  profile: Profile;
}

export const DashboardHeader = ({ profile }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-black/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/69e7d46f-8144-4149-9a8d-cacef5727c53.png" 
            alt="SAWD LINK" 
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent">SAWD LINK</h1>
            <p className="text-sm text-white/60">Welcome back, {profile.display_name}</p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="border-white/20 text-white/80 hover:bg-white/10 hover:border-fuchsia-400/30"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};
