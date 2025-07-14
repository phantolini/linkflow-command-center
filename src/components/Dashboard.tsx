import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { LinkEditor } from "./LinkEditor";
import { ProfilePreview } from "./ProfilePreview";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, BarChart3, Edit, Eye } from "lucide-react";

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

export const Dashboard = ({ user }: { user: User }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    try {
      const username = user.email?.split('@')[0] || 'user';
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: username,
          display_name: user.user_metadata?.full_name || username,
          bio: '',
          theme: 'cyber',
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Setup Required</h2>
          <p className="text-white/60">There was an issue creating your profile. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black relative overflow-hidden">
      {/* Animated fluid blob backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-fuchsia-400/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-fuchsia-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-xl blob-animation-delayed-2"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-fuchsia-300/15 to-pink-400/15 rounded-full filter blur-xl blob-animation"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList className="bg-black/40 border border-white/10 backdrop-blur-md">
              <TabsTrigger value="editor" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
                <Edit className="h-4 w-4 mr-2 text-fuchsia-400" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
                <Eye className="h-4 w-4 mr-2 text-fuchsia-400" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-fuchsia-500/20 data-[state=active]:text-white text-white/60">
                <BarChart3 className="h-4 w-4 mr-2 text-fuchsia-400" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <LinkEditor 
                profile={profile} 
                onProfileUpdate={handleProfileUpdate}
                userId={user.id}
              />
            </TabsContent>

            <TabsContent value="preview">
              <ProfilePreview profile={profile} />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
