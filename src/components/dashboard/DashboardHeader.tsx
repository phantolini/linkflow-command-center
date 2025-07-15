
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface DashboardHeaderProps {
  profile: Profile;
}

export const DashboardHeader = ({ profile }: DashboardHeaderProps) => {
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

  const handleSignOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Force page reload for clean state
      window.location.href = '/';
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
